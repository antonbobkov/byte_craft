module Cat
(
    makeCat
) where

import Codec.Picture.Repa
import Codec.Picture
import Data.Array.Repa as R hiding ((++))
import qualified Data.ByteString as BS
import qualified Data.Vector.Unboxed as V

import Numeric
import Data.Bits
import Data.Word
import Data.Char
import Data.HexString

import Control.Monad

convert24to8 :: Word8 -> Word8 -> Word8 -> Word8
convert24to8 r_ g_ b_ = shiftL r 5 .|. shiftL g 2  .|. shiftL b 0  where
    r = round $ 7 * fromIntegral r_ / 256
    g = round $ 7 * fromIntegral g_ / 256
    b = round $ 3 * fromIntegral b_ / 256

-- |
-- helper function for grouping lists
group :: Int -> [a] -> [[a]]
group _ [] = []
group n l
  | n > 0 = take n l : group n (drop n l)
  | otherwise = error "Negative n"

makeCat = do
    orig' <- readImageRGBA "cat.bmp"
    let
        orig = imgData $ either error id orig'
        Z:.w:.h:.c = R.extent orig
        tfunc lkup (Z:.x:.y) =
            convert24to8 (lkup (Z:.x:.y:.0)) (lkup (Z:.x:.y:.1)) (lkup (Z:.x:.y:.2))
        bytes' = R.traverse orig (const (Z:.w:.h)) tfunc
    bytes <- R.computeP bytes'
    BS.writeFile "cat.txt" $ BS.pack . V.toList . R.toUnboxed $ bytes
    let
        why =  Prelude.map BS.pack . group 32 . V.toList . R.toUnboxed $ bytes
    forM (zip [0..] why) $ \(i, x) ->
        putStrLn $ "screen[i].colors[" ++ show i ++ "] = hex" ++ show (toText (fromBytes x)) ++ ";"
    -- doesn't work in solidity for whatever reason
    --print $ fromBytes (BS.pack . V.toList . R.toUnboxed $ bytes)
