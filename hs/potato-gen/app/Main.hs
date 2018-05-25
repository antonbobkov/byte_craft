

import qualified Data.ByteString.Lazy as B
import Data.Array.Repa as R
import Data.Array.Repa.Eval as R
import Graphics.Gloss
import Data.Word
import Codec.Picture.Repa
import Codec.Picture
import System.Environment (getArgs)

import Debug.Trace
import Lib

main = do
    orig' <- readImageRGBA "1024.png"
    let orig = imgData (either error id orig')
    putStrLn (show $ R.extent orig)
    arr <- query orig
    let
        wimg = Img arr
        mkPic img = let (Z:.c:.r:.z) = extent (imgData img)
             in bitmapOfByteString r c (BitmapFormat TopToBottom PxRGBA) (toByteString img) True
        glossImg =  (mkPic $ wimg)
    B.writeFile ("output.png") $ imageToPng (imgToImage wimg)
    -- display (InWindow "mochi" (800,600) (0,0)) white (Scale 100 100 glossImg)
