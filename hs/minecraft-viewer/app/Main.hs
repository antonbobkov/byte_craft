
{-# LANGUAGE ScopedTypeVariables   #-}

import Control.Exception
import qualified Data.ByteString.Lazy as B
import Data.Array.Repa as R hiding ((++))
import Codec.Picture.Repa
import Codec.Picture
import System.Exit

import Lib
import Cat

rinkebyContractAddr = "0x63c7207f1fee3f6c6ba65d2d5a08ef91e7c712b7"
rinkebyProvider = "https://rinkeby.infura.io/"

mainnetContractAddr =  "0x86c7989ABC839ddcE2e77f71f979a3F42a0F0420"
mainnetProvider = "https://api.myetherapi.com/eth"

thunderContractAddr = "0xc8e2da407c5683e2bc57aaeec28a668ab6b664d0"
thunderProvider = "http://testnet-rpc.thundercore.com:8545"

makeImage ::
    String
    -> String
    -> String
    -> IO ()
makeImage prefix address provider = do
    putStrLn $ "Processing " ++ prefix ++ ":"
    let
        filename = prefix++"1024.png"
    orig' <- readImageRGBA filename
    let orig = imgData $ flipVertically `onImg` either error id orig'
    putStrLn $ "loaded initial image of size: " ++ show (R.extent orig)
    putStrLn "querying and constructing new image"
    arr <- query prefix address provider orig
    let wimg = Img arr
    putStrLn "writing image"
    B.writeFile filename $ imageToPng (imgToImage wimg)

main = do
    handle (\(e :: SomeException) -> print e) $ makeImage "thunder" thunderContractAddr thunderProvider
    handle (\(e :: SomeException) -> print e) $ makeImage "rb" rinkebyContractAddr rinkebyProvider
    handle (\(e :: SomeException) -> print e) $ makeImage "main" mainnetContractAddr mainnetProvider
    --handle (const exitFailure) $ makeImage "" mainnetContractAddr mainnetProvider
    exitSuccess
