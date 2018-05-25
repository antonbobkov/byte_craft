{-# LANGUAGE DataKinds             #-}
{-# LANGUAGE DeriveGeneric         #-}
{-# LANGUAGE FlexibleInstances     #-}
{-# LANGUAGE MultiParamTypeClasses #-}
{-# LANGUAGE OverloadedStrings     #-}
{-# LANGUAGE QuasiQuotes           #-}





module Lib (
query,
bwidth,
bheight
) where

import Network.HTTP.Client.TLS

import Network.Ethereum.Contract.TH
import Network.Ethereum.Web3
import Network.Ethereum.Web3.Provider
import           Data.Default                      (Default (..))

import Control.Monad (forM)
import qualified Basement.Sized.List as L
import Data.Word

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

bwidth :: Int
bwidth = 4
bheight :: Int
bheight = 4
bwidth' = fromInteger . toInteger $ bwidth
bheight' = fromInteger . toInteger $ bheight

myCall = def { callTo = Just ("0xD6528Ff2983A6d90783eB62E19D37C7b599FCec4") }

web3test = do
    xs  <- forM [(x,y) | x <- [0..bwidth'-1], y <- [0..bheight'-1]] $ uncurry (getColor myCall)
    return $ concat $ map (L.unListN . L.map (fromIntegral . toInteger)) xs

query :: IO (Either Web3Error [Word8])
query = do
    manager <- newTlsManager
    runWeb3With manager (HttpProvider myprov) web3test
