
{-# LANGUAGE ScopedTypeVariables   #-}

import Control.Exception
import qualified Data.ByteString.Lazy as B
import Data.Array.Repa as R hiding ((++))
--import Data.Array.Repa.Eval as R
--import Graphics.Gloss
--import Data.Word
import Codec.Picture.Repa
import Codec.Picture
--import System.Environment (getArgs)
import System.Exit

import Lib

rinkebyContractAddr = "0xd6a4c0b69a3019e2e833d50af2f33c961c72bd7e"
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
    handle (\(e :: SomeException) -> exitFailure) $ makeImage "" rinkebyContractAddr rinkebyProvider
    --handle (const exitFailure) $ makeImage "" mainnetContractAddr mainnetProvider
    exitSuccess
