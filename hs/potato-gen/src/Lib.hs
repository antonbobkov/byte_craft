
{-# LANGUAGE DataKinds             #-}
{-# LANGUAGE DeriveGeneric         #-}
{-# LANGUAGE FlexibleInstances     #-}
{-# LANGUAGE MultiParamTypeClasses #-}
{-# LANGUAGE OverloadedStrings     #-}
{-# LANGUAGE QuasiQuotes           #-}
{-# LANGUAGE ScopedTypeVariables           #-}
{-# LANGUAGE FlexibleContexts           #-}
{-# LANGUAGE MultiWayIf           #-}




module Lib (
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
import Control.Monad (forM)
import qualified Basement.Sized.List as L
import Data.Word
import Data.Bits
import Data.Serialize.Put
import qualified Data.ByteString as B


import Data.Array.Repa as R
import Data.Array.Repa.Eval as R

import Debug.Trace

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

-- global width/height
bwidth :: Int
bwidth = 32
bheight :: Int
bheight = 32
bwidth' = fromInteger . toInteger $ bwidth
bheight' = fromInteger . toInteger $ bheight

cwidth :: Int
cwidth = 32
cheight :: Int
cheight = 32

myCall = def { callTo = Just "0x7DBBcE351ec9334fd378A6C5Ba2ac8Dc27ea4f5C" }

fst3 (x,_,_) = x

web3test :: Web3 [B.ByteString]
web3test = do
    xs <- forM [(x,y) | y <- [0..bheight'-1], x <- [0..bwidth'-1]]
        (\(x,y) -> liftIO (putStrLn $ "fetching " Prelude.++ show x Prelude.++ " " Prelude.++ show y) >> getChunk myCall x y)
    return $ Prelude.map (runPut . abiPut . fst3) xs


toColor :: Float -> Word8 -> Word8
toColor res w = round $ ((fromIntegral w) / res) * 256

maketfunc :: [B.ByteString] -> (R.DIM3 -> Word8) -> R.DIM3 -> Word8
maketfunc chunks _ (Z:.x:.y:.c) = final where
    xc = x `div` cwidth
    yc = y `div` cheight
    xr = x `mod` cwidth
    yr = y `mod` cheight
    bs = chunks !! (yc*bwidth + xc)
    word = B.index bs (yr*cwidth + xr)
    final = if
        | c == 0 -> toColor 8 $ shiftR (0xE0 `xor` word) 5
        | c == 1 -> toColor 8 $ shiftR (0x1C `xor` word) 2
        | c == 2 -> toColor 4 $ shiftR (0x03 `xor` word) 0
        | c == 3 -> 255



updateImage ::
    (R.Source r Word8) =>
    [B.ByteString]
    -> R.Array r R.DIM3 Word8 -- ^ input array
    -> R.Array R.D R.DIM3 Word8
updateImage chunks img = R.traverse img id (maketfunc chunks)

query :: (R.Source r Word8) => R.Array r R.DIM3 Word8 -> IO (R.Array R.D R.DIM3 Word8)
query img = do
    manager <- newTlsManager
    chunks' <- runWeb3With manager (HttpProvider myprov) web3test
    let chunks = either (\e -> trace (show e) undefined) id chunks'
    return $ updateImage chunks img


--[(ListN 32 (BytesN 32), Address, UIntN 256)]’
