
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

thunderContractAddr = "0xe7b94ff151b0bd883f29708f6b0eef8ff3c17de0"
thunderProvider = "http://34.212.240.178:8545"

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
    handle (\(e :: SomeException) -> exitFailure) $ makeImage "thunder" thunderContractAddr thunderProvider
    handle (\(e :: SomeException) -> exitFailure) $ makeImage "rb" rinkebyContractAddr rinkebyProvider
    handle (\(e :: SomeException) -> exitFailure) $ makeImage "main" mainnetContractAddr mainnetProvider
    --handle (const exitFailure) $ makeImage "" mainnetContractAddr mainnetProvider
    exitSuccess
