
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

--mainnetContractAddr =
--mainnetProvider = https://api.myetherapi.com/eth

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
    handle (\(e :: SomeException) -> exitFailure) $ makeImage "rb" rinkebyContractAddr rinkebyProvider
    handle (\(e :: SomeException) -> exitFailure) $ makeImage "main" rinkebyContractAddr rinkebyProvider
    handle (\(e :: SomeException) -> exitFailure) $ makeImage "thunder" rinkebyContractAddr rinkebyProvider
    --handle (const exitFailure) $ makeImage "" mainnetContractAddr mainnetProvider
    exitSuccess
