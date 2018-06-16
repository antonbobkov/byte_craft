
{-# LANGUAGE DataKinds             #-}
{-# LANGUAGE DeriveGeneric         #-}
{-# LANGUAGE FlexibleInstances     #-}
{-# LANGUAGE MultiParamTypeClasses #-}
{-# LANGUAGE OverloadedStrings     #-}
{-# LANGUAGE QuasiQuotes           #-}
{-# LANGUAGE ScopedTypeVariables   #-}
{-# LANGUAGE FlexibleContexts      #-}
{-# LANGUAGE MultiWayIf            #-}
{-# LANGUAGE DeriveAnyClass        #-}
{-# LANGUAGE MagicHash        #-}
{-# LANGUAGE BangPatterns        #-}

module Lib (
    makeEntries,
    query,
    bwidth,
    bheight
) where

import Network.HTTP.Client.TLS

import Network.Ethereum.ABI.Class
import Network.Ethereum.Contract.TH
import Network.Ethereum.Web3
import Network.Ethereum.Web3.Provider

import Control.Monad.IO.Class
import qualified Control.Monad.Parallel as Par
import Control.Monad
import Control.DeepSeq (deepseq)
import Control.Exception (throw, Exception)

import Data.Word
import Data.Bits
import Data.Serialize.Put
import Data.Serialize.Get
import Data.String (fromString)
import Data.List (sort, deleteFirstsBy, find)
import Data.List.Index (indexed)
import Data.Maybe (fromMaybe, catMaybes, mapMaybe)
import Data.Array.Repa as R hiding ((++), map)
import Data.Array.Repa.Eval as R
import qualified Data.ByteString as B
import qualified Data.ByteString.Lazy as BL hiding (pack)
import qualified Data.ByteString.Lazy.Char8 as BL
import           Data.Default                      (Default (..))
import Data.Time.Clock
import Data.Aeson
import GHC.Generics
import GHC.Exts

import Debug.Trace
import Control.Exception.Base






-- rinkby
myCall = def { callTo = Just "0xd6a4c0b69a3019e2e833d50af2f33c961c72bd7e" }
myprov = "https://rinkeby.infura.io/"

-- load abi
[abiFrom|newpotato.json|]











data Entry = Entry {
  pos_x :: Int
  , pos_y :: Int
  , address :: String
  , cost :: Int
} deriving (Generic, ToJSON, FromJSON, Show, Ord, Eq)

posEqual (Entry x y _ _) (Entry a b _ _) = x == a && y == b


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

fst3 (x,_,_) = x

-- |
-- [(x,y), color, owner, price, lastUpdated]
type ChunkInfo = ((Int,Int), B.ByteString, Address, Int, Int)


queryAllBlocks :: Web3 [ChunkInfo]
queryAllBlocks = forM [(x,y) | y <- [0..bheight-1], x <- [0..bwidth-1]] queryBlock

queryBlock :: (Int, Int) -> Web3 ChunkInfo
queryBlock (x,y) = do
    liftIO (putStrLn $ "fetching " ++ show x ++ " " ++ show y)
    (color, addr, val, lastBlock) <- getChunk myCall (fromIntegral x) (fromIntegral y)
    return ((x,y), runPut (abiPut color), addr, fromIntegral val, fromIntegral lastBlock)

toColor :: Float -> Word8 -> Word8
toColor res w = round $ (fromIntegral w / res) * 255

-- | make traversal function to update image with updated data
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
            | c == 0 -> toColor 7 $ shiftR (0xE0 .&. word) 5
            | c == 1 -> toColor 7 $ shiftR (0x1C .&. word) 2
            | c == 2 -> toColor 3 $ shiftR (0x03 .&. word) 0
            | c == 3 -> 255
    final = fromMaybe (f s) found


makeEntries :: [ChunkInfo] -> [Entry]
makeEntries = Prelude.map (\((x,y),_,addr,cost,_) -> Entry x y (show addr) cost)


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
  | n > 0 = (take n l) : (group n (drop n l))
  | otherwise = error "Negative n"


data AesonDecodeException = AesonDecodeException deriving (Show)
instance Exception AesonDecodeException



-- mainnet
-- myprov = "https://api.myetherapi.com/eth"
-- myprov = "https://ropsten.infura.io/"

-- rinkby



-- |
-- raises all web3 exceptions
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
        myCall = def { callTo = Just (fromString address) }
        provider = HttpProvider provider_
        doW3 = runWeb3With manager provider

    putStrLn "reading update times..."
    lastUpdated' <- BL.readFile "lastUpdate.json"
    updateTimes' <- doW3 (getUpdateTimes myCall)
    updated' <- doW3 (lastUpdate myCall)
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
        n = 8
    putStrLn $ "querying pairs: " ++ show queryPairs
    (chunks :: [ChunkInfo]) <- concat <$> forM (group n queryPairs) (\pts ->
        Par.forM pts $ \pt -> do
            x <- runWeb3With manager (HttpProvider myprov) (queryBlock pt)
            return $ either throw id x)



    -- DELETE
    -- all blocks sequentially
    --chunks' <- runWeb3With manager (HttpProvider myprov) queryAllBlocks
    --let chunks = either (\e -> trace (show e) undefined) id chunks'

    -- just a single block
    --block' <- runWeb3With manager (HttpProvider myprov) $ queryBlock (0,0)
    --let chunks = [either (\e -> trace (show e) undefined) id block']

    -- read existing entries
    inEntries' <- BL.readFile "values.json"
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
    inEntries' `deepseq` BL.writeFile "values.json" entries
    putStrLn $ "writing values.js with " ++ show (length sortedEntries) ++ " entries"
    BL.writeFile "values.js" (BL.append "values=" entries)
    BL.writeFile "lastUpdate.json" . encode $ updated

    -- log what we did
    time <- getCurrentTime
    BL.appendFile "log.txt" $ BL.pack $ show time ++ " " ++ logEntries ++ "\n"

    return $ updateImage chunks img
