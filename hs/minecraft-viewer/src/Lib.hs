
{-# LANGUAGE DataKinds             #-}
{-# LANGUAGE DeriveAnyClass        #-}
{-# LANGUAGE DeriveGeneric         #-}
{-# LANGUAGE FlexibleContexts      #-}
{-# LANGUAGE FlexibleInstances     #-}
{-# LANGUAGE MagicHash             #-}
{-# LANGUAGE MultiParamTypeClasses #-}
{-# LANGUAGE MultiWayIf            #-}
{-# LANGUAGE OverloadedStrings     #-}
{-# LANGUAGE QuasiQuotes           #-}
{-# LANGUAGE ScopedTypeVariables   #-}

module Lib (
    query
) where

import           Network.HTTP.Client.TLS
import           Network.Ethereum.ABI.Class
import           Network.Ethereum.Contract.TH
import           Network.Ethereum.Web3
import           Network.Ethereum.Web3.Provider

import           Control.Exception.Base
import           Control.DeepSeq                (deepseq)
import           Control.Exception              (Exception, throw)
import           Control.Monad
import           Control.Monad.IO.Class
import qualified Control.Monad.Parallel         as Par
import           GHC.Exts
import           GHC.Generics

import           Data.Aeson
import           Data.Array.Repa                as R hiding (map, (++))
import           Data.Array.Repa.Eval           as R
import           Data.Bits
import qualified Data.ByteString                as B
import qualified Data.ByteString.Lazy           as BL hiding (pack)
import qualified Data.ByteString.Lazy.Char8     as BL
import           Data.Default                   (Default (..))
import           Data.List                      (deleteFirstsBy, find, sort)
import           Data.List.Index                (indexed)
import           Data.Maybe                     (catMaybes, fromMaybe, mapMaybe)
import           Data.Serialize.Get
import           Data.Serialize.Put
import           Data.String                    (fromString)
import           Data.Time.Clock
import           Data.Word



-- load abi
[abiFrom|newpotato.json|]

-- |
-- [(x,y), color, owner, price, lastUpdated]
type ChunkInfo = ((Int,Int), B.ByteString, Address, Int, Int)

-- |
-- represents an entry in the image
data Entry = Entry {
  pos_x     :: Int
  , pos_y   :: Int
  , address :: String
  , cost    :: Int
} deriving (Generic, ToJSON, FromJSON, Show, Ord, Eq)

posEqual :: Entry -> Entry -> Bool
posEqual (Entry x y _ _) (Entry a b _ _) = x == a && y == b

makeEntries :: [ChunkInfo] -> [Entry]
makeEntries = Prelude.map (\((x,y),_,addr,cost,_) -> Entry x y (show addr) cost)

-- global width/height
bwidth :: Int
bwidth = 32
bheight :: Int
bheight = 32

-- chunk width/height
cwidth :: Int
cwidth = 32
cheight :: Int
cheight = 32

-- helper
fst3 (x,_,_) = x

-- |
-- query a single block in the contract
queryBlock :: Call -> (Int, Int) -> Web3 ChunkInfo
queryBlock call (x,y) = do
    liftIO (putStrLn $ "fetching " ++ show x ++ " " ++ show y)
    (color, addr, val, lastBlock) <- getChunk call (fromIntegral x) (fromIntegral y)
    return ((x,y), runPut (abiPut color), addr, fromIntegral val, fromIntegral lastBlock)

-- helper to convert 8bit color to 32 bit color
convert8To32 ::
    Float -- ^ max resolution
    -> Word8 -- ^ 8 bit color component
    -> Word8 -- ^ 32 bit color component
convert8To32 res w = round $ (fromIntegral w / res) * 255

-- make traversal function to update image with updated data
maketfunc :: [ChunkInfo] -> (R.DIM3 -> Word8) -> R.DIM3 -> Word8
maketfunc chunks f s@(Z:.y:.x:.c) = final where
    xc = x `div` cwidth
    yc = y `div` cheight
    xr = x `mod` cwidth
    yr = y `mod` cheight
    found = do
        (_,bs,_,_,_) <- find (\((x,y),_,_,_,_) -> xc == x && yc == y) chunks
        let word = B.index bs (yr*cwidth + xr)
        return $ if
            | c == 0 -> convert8To32 7 $ shiftR (0xE0 .&. word) 5
            | c == 1 -> convert8To32 7 $ shiftR (0x1C .&. word) 2
            | c == 2 -> convert8To32 3 $ shiftR (0x03 .&. word) 0
            | c == 3 -> 255
    final = fromMaybe (f s) found

-- |
-- update the repa array image with given chunk info
updateImage ::
    (R.Source r Word8) =>
    [ChunkInfo]
    -> R.Array r R.DIM3 Word8 -- ^ input array
    -> R.Array R.D R.DIM3 Word8
updateImage chunks img = R.traverse img id (maketfunc chunks)

-- |
-- helper function for grouping lists
group :: Int -> [a] -> [[a]]
group _ [] = []
group n l
  | n > 0 = take n l : group n (drop n l)
  | otherwise = error "Negative n"

-- exception
data AesonDecodeException = AesonDecodeException deriving (Show)
instance Exception AesonDecodeException

-- |
-- throws exceptions on failure
query ::
    (R.Source r Word8) =>
    String -- ^ prefix
    -> String -- ^ address
    -> String -- ^ provider
    -> R.Array r R.DIM3 Word8 -- ^ input image
    -> IO (R.Array R.D R.DIM3 Word8)
query prefix address provider_ img = do

    manager <- newTlsManager
    let
        callData = def { callTo = Just (fromString address) }
        provider = HttpProvider provider_
        doW3 = runWeb3With manager provider

    putStrLn "reading update times..."
    lastUpdated' <- BL.readFile (prefix ++ "lastUpdate.json")
    updateTimes' <- doW3 (getUpdateTimes callData)
    updated' <- doW3 (lastUpdateOverall callData)
    let
        lastUpdated = fromMaybe 0 $ decode lastUpdated'
        (updateTimes :: [Int]) = map fromIntegral $ GHC.Exts.toList (either throw id updateTimes')
        (updated :: Int) = either throw fromIntegral updated'


    let
        --allPairs = [(x,y) | y <- [0..bheight-1], x <- [0..bwidth-1]]
        queryPairs =
            mapMaybe
            (\(i,x) -> if x > lastUpdated then Just (i `mod` cwidth, i `div` cwidth) else Nothing)
            (indexed updateTimes)
        -- make 8 http requests at once, this is a reasonable and safe number
        n = 8
    putStrLn $ "querying pairs: " ++ show queryPairs
    chunks <- concat <$> forM (group n queryPairs) (\pts ->
        Par.forM pts $ \pt -> do
            x <- doW3 (queryBlock callData pt)
            return $ either throw id x)

    -- read existing entries
    inEntries' <- BL.readFile (prefix ++ "values.json")
    let
        --parse them
        inEntries :: [Entry]
        inEntries = fromMaybe (throw AesonDecodeException) $ decode inEntries'
        -- delete existing entries
        newEntries = makeEntries chunks
        entries' = deleteFirstsBy posEqual inEntries newEntries
        -- put them back and sort everything
        sortedEntries = entries' ++ newEntries
        entries = encode . sort $ sortedEntries
        -- log new entries
        logEntries = show $ map (\(Entry x y _ _) -> (x,y)) newEntries

    -- deepseq needed so BL.readFile above will finish reading and close the handle
    inEntries' `deepseq` BL.writeFile (prefix ++ "values.json") entries
    putStrLn $ "writing values.js with " ++ show (length sortedEntries) ++ " entries"
    BL.writeFile (prefix ++ "values.js") (BL.append "values=" entries)
    BL.writeFile (prefix ++ "lastUpdate.json") . encode $ updated

    -- log what we did
    time <- getCurrentTime
    BL.appendFile "log.txt" $ BL.pack $
        prefix ++ " " ++ show time ++ " " ++ logEntries ++ "\n"

    return $ updateImage chunks img
