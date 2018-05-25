

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
    web3 <- query
    -- ie <- readImageRGBA "1024.jpg"
    let
        wi = either (\e -> trace (show e) undefined) id web3
        --i = either error id ie
        arr :: R.Array R.U R.DIM3 Word8
        arr = R.fromList (Z:.bwidth:.bheight:.3) wi
        wimg = Img $ R.delay arr
        -- mkPic img = let (Z:.c:.r:.z) = extent (imgData img)
        --     in bitmapOfByteString r c (BitmapFormat TopToBottom PxRGBA) (toByteString img) True
        glossImg =  (mkPic $ wimg)
    B.writeFile ("output.png") $ imageToPng (imgToImage wimg)
    display (InWindow "mochi" (800,600) (0,0)) white (Scale 100 100 glossImg)
    -- display (FullScreen (800,600)) white (mkPic i)
    -- display (FullScreen (800,600)) white (mkPic $ flipHorizontally`onImg`  i)
    -- display (FullScreen (800,600)) white (mkPic $ (flipVertically . flipHorizontally) `onImg` i)
