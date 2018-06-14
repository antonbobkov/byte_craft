
{-# LANGUAGE DataKinds             #-}
{-# LANGUAGE DeriveGeneric         #-}
{-# LANGUAGE FlexibleInstances     #-}
{-# LANGUAGE MultiParamTypeClasses #-}
{-# LANGUAGE OverloadedStrings     #-}
{-# LANGUAGE QuasiQuotes           #-}
{-# LANGUAGE ScopedTypeVariables           #-}
{-# LANGUAGE FlexibleContexts           #-}
{-# LANGUAGE MultiWayIf           #-}
{-# LANGUAGE DeriveAnyClass #-}

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
import           Data.Default                      (Default (..))

import Control.Monad.IO.Class
import Control.Concurrent
import Control.Concurrent.Chan
import Control.Monad (forM, forM_)
import qualified Basement.Sized.List as L
import Data.Word
import Data.Bits
import Data.Serialize.Put
import qualified Data.ByteString as B
import qualified Data.ByteString.Lazy as BL

import Data.List (find)
import Data.Maybe (fromMaybe)
import Data.Array.Repa as R
import Data.Array.Repa.Eval as R

import Debug.Trace
import Control.Exception.Base

import GHC.Generics
import Data.Aeson

[abiFrom|potato.json|]

{- getColor ::
Network.Ethereum.Web3.Types.Call
-> Network.Ethereum.ABI.Prim.Int.UIntN 8
-> Network.Ethereum.ABI.Prim.Int.UIntN 8
-> Network.Ethereum.Web3.Provider.Web3
     (basement-0.0.7:Basement.Sized.List.ListN
        3 (Network.Ethereum.ABI.Prim.Int.UIntN 8)) -}

-- myprov = "https://api.myetherapi.com/eth"
myprov = "https://ropsten.infura.io/"


data Entry = Entry {
  pos_x :: Int
  , pos_y :: Int
  , address :: String
  , cost :: Int
} deriving (Generic, ToJSON, FromJSON, Show)




-- global width/height
bwidth :: Int
bwidth = 32
bheight :: Int
bheight = 32

cwidth :: Int
cwidth = 32
cheight :: Int
cheight = 32

myCall = def { callTo = Just "0x7DBBcE351ec9334fd378A6C5Ba2ac8Dc27ea4f5C" }

fst3 (x,_,_) = x

-- [(x,y), color, owner, price]
web3test :: Web3 [((Int,Int), B.ByteString, Address, Int)]
web3test = do
    forM [(x,y) | y <- [0..bheight-1], x <- [0..bwidth-1]] queryBlock

queryBlock :: (Int, Int) -> Web3 ((Int,Int), B.ByteString, Address,  Int)
queryBlock (x,y) = do
    liftIO (putStrLn $ "fetching " Prelude.++ show x Prelude.++ " " Prelude.++ show y)
    (color, addr, val) <- getChunk myCall (fromIntegral x) (fromIntegral y)
    return ((x,y), runPut (abiPut color), addr, fromIntegral val)

toColor :: Float -> Word8 -> Word8
toColor res w = round $ (fromIntegral w / res) * 256

-- | make traversal function to update image with updated data
maketfunc :: [((Int,Int),B.ByteString, Address, Int)] -> (R.DIM3 -> Word8) -> R.DIM3 -> Word8
maketfunc chunks f s@(Z:.x:.y:.c) = final where
    xc = x `div` cwidth
    yc = y `div` cheight
    xr = x `mod` cwidth
    yr = y `mod` cheight
    found = do
        (_,bs,_,_) <- find (\((x,y),_,_,_) -> xc == x && yc == y) chunks
        let word = B.index bs (yr*cwidth + xr)
        return $ if
            | c == 0 -> toColor 8 $ shiftR (0xE0 `xor` word) 5
            | c == 1 -> toColor 8 $ shiftR (0x1C `xor` word) 2
            | c == 2 -> toColor 4 $ shiftR (0x03 `xor` word) 0
            | c == 3 -> 255
    final = fromMaybe (f s) found


makeEntries :: [((Int,Int),B.ByteString, Address, Int)] -> [Entry]
makeEntries = Prelude.map (\((x,y),_,addr,cost) -> Entry x y (show addr) cost)


updateImage ::
    (R.Source r Word8) =>
    [((Int,Int), B.ByteString, Address, Int)]
    -> R.Array r R.DIM3 Word8 -- ^ input array
    -> R.Array R.D R.DIM3 Word8
updateImage chunks img = R.traverse img id (maketfunc chunks)

query :: (R.Source r Word8) => R.Array r R.DIM3 Word8 -> IO (R.Array R.D R.DIM3 Word8)
query img = do
    manager <- newTlsManager

    {-
    blockChan <- newChan
    let queryPairs = [(x,y) | y <- [0..bheight-1], x <- [0..bwidth-1]]
    --let queryPairs = [(x,y) | y <- [0..2], x <- [0..2]]
    forM_ queryPairs $ \pt -> forkIO $ do
        x <- runWeb3With manager (HttpProvider myprov) (queryBlock pt)
        writeChan blockChan x

    -- this will block indefinitely if any of the above fail
    -- TODO fail gracefull instead, though maybe that should happen outside this function
    chunks <- forM [1..length queryPairs] $ \_ -> do
        b <- readChan blockChan
        return $ either (\e -> trace (show e) undefined) id b
    -}


    -- DELETE
    -- all blocks sequentially
    chunks' <- runWeb3With manager (HttpProvider myprov) web3test
    let chunks = either (\e -> trace (show e) undefined) id chunks'

    -- just a single block
    --block' <- runWeb3With manager (HttpProvider myprov) $ queryBlock (0,0)
    --let chunks = [either (\e -> trace (show e) undefined) id block']

    print $ makeEntries chunks
    BL.writeFile "values.json" . encode . makeEntries $ chunks
    return $ updateImage chunks img


--[(ListN 32 (BytesN 32), Address, UIntN 256)]’
