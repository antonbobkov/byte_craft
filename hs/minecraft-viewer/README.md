# potato-gen

In this readme, we'll go over how we made the [bytecraft](http://bytecraft.club/) image generator using the Haskell [web3 package](https://hackage.haskell.org/package/web3). We use several other packages in here too which I will only cover as much as necessary. Our main goal here is to cover how to use the web3 package in Haskell.

First we need to load the abi of our contract:
```haskell
[abiFrom|newpotato.json|]
```
This is the ~MaGiC sAuCe~ of the Haskell web3 module. It uses Template Haskell to generate type-checked Haskell methods that call our smart contract. This is what makes Haskell such a great language for writing your smart contract apps!

The function names match those in the ABI. I find it helpful to define an incorrectly typed method to get the signature. For example, in our case, this

```haskell
compileErrorGiveMeType :: ()
compileErrorGiveMeType = getUpdateTimes
```
gives this error in ghc:
```
• Couldn't match expected type ‘()’
			  with actual type ‘Call -> Web3 (ListN 1024 (UIntN 256))’
```
In this case, `getUpdateTimes` is a function taking a `Call` type and returns `ListN 1024 (UIntN 256)` wrapped in the `Web3` type. We'll unpack all these types soon. For now, know that this function matches the following function in our solidity contract:
```solidity
function getUpdateTimes() external view
	returns(uint[global_length])
```

Our smart contract lets users claim 32x32 chunks of pixels from a 1024x1024 grid. Each Chunk is 1024 pixels and there are 1024 chunks. To upload a 32x32 8-bit image to the chunk, the user must put a stake on the chunk. If there's already a stake on the chunk, the new stake must be greater than the previous one and in this case, the previous stake is returned to its owner.

The main method in this module is `query`:
```haskell
query ::
    (R.Source r Word8) =>
    String -- ^ prefix
    -> String -- ^ address
    -> String -- ^ provider
    -> R.Array r R.DIM3 Word8 -- ^ input image
    -> IO (R.Array R.D R.DIM3 Word8)
```
which takes 3 network parameters: a filename prefix for output, the contract address, and the web3 provider URL. It also takes an input image represented as a [repa](https://hackage.haskell.org/package/repa-3.4.1.3/docs/Data-Array-Repa.html) array. This is the last image processed which will be modified to contain all updated chunks since the last time this function is called. Finally it returns an image newly updated image as an `IO` operation.

Inside this method, the first thing we do is set up some helpers to facilitate calling the web3 api:
```haskell
manager <- newTlsManager
let
	callData = def { callTo = Just (fromString address) }
	provider = HttpProvider provider_
	doW3 = runWeb3With manager provider
```
Since we don't run our own full node on our free GCloud instance, we'll be relying on an external http provider. Our connection needs to be [TLS](https://en.wikipedia.org/wiki/Transport_Layer_Security) so using `newTlsManager` from the `http-client-tls` package is necessary.

Next we set up `callData` which has `Call` type we saw earlier. The `Call` is a record type containing [information about how to make our web3 call](http://hackage.haskell.org/package/web3-0.7.3.0/docs/Network-Ethereum-Web3.html#t:Call). In our case, we only care about the `callTo` parameter. The funny syntax is from the `data-default` package which provides default values to the other parameters.

`provider` is where we'll be sending our web3 RPC calls to. Finally `doW3` makes the requests using the manager and provider we just created. `doW3` calls `runWeb3With` with the manager and provider we just created.
```haskell
runWeb3With :: MonadIO m => Manager -> Provider -> Web3 a -> m (Either Web3Error a)
```
We saw the `Web3` monad earlier. It wraps a web3 RPC call and  [`runWeb3With`](http://hackage.haskell.org/package/web3-0.7.3.0/docs/Network-Ethereum-Web3-Provider.html#v:runWeb3With) executes the `Web3` monad inside the `IO` monad.

Next we poll for the last block number each chunk was updated. We also poll for the last time the contract itself to compare against the cached value in "..lastUpdate.json":

```haskell
lastUpdated' <- BL.readFile (prefix ++ "lastUpdate.json")
updateTimes' <- doW3 (getUpdateTimes callData)
updated' <- doW3 (lastUpdateOverall callData)
let
	lastUpdated = fromMaybe 0 $ decode lastUpdated'
	(updateTimes :: [Int]) = map fromIntegral $ GHC.Exts.toList (either throw id updateTimes')
	(updated :: Int) = either throw fromIntegral updated'
```

Here we see our first web3 call! Using the `doW3` and `callData` we'll get a value of type `m (Either Web3Error a)`. We don't do any error handling in this example so you'll see expressions like `either throw id updateTimes'` a lot. This gets us the data but it's of type `ListN 1024 (UIntN 256)`. These come from the  [`Network.Ethereum.ABI.Prim`](http://hackage.haskell.org/package/web3-0.7.3.0/docs/Network-Ethereum-ABI-Prim.html) module which contain representations of all the EVM types.
```
Network.Ethereum.ABI.Prim
Network.Ethereum.ABI.Prim.Address
Network.Ethereum.ABI.Prim.Bool
Network.Ethereum.ABI.Prim.Bytes
Network.Ethereum.ABI.Prim.Int
Network.Ethereum.ABI.Prim.List
Network.Ethereum.ABI.Prim.String
Network.Ethereum.ABI.Prim.Tagged
Network.Ethereum.ABI.Prim.Tuple
Network.Ethereum.ABI.Prim.Tuple.TH
```
If you need a refresher on the EVM types, this is a good time to checkout the [solidity docs](http://solidity.readthedocs.io/en/v0.4.24/).

Looking back at the definitions of `getUpdateTimes`, we see the solidity type `uint[1024]` becomes `ListN 1024 (UIntN 256)`. This is a 1024 element list of 256-bit unsigned ints with both sizes fixed at the type level! `ListN` is an instance of `IsList` which has the type family `Item` implemented as
```haskell
type Item (ListN n a) = a
```
which has the method
```haskell
toList :: l -> [Item l]
```
allowing us to get the more familiar `[Int]` using
```haskell
(updateTimes :: [Int]) = map fromIntegral $ GHC.Exts.toList (either throw id updateTimes')
```
`UIntN` is an instance of `Integral` so we can convert it using `fromIntegral`.

Ok! So now we got our first Haskell primitive from our smart contract! Next we want to get the actual image data from each chunk:

```haskell
let
	queryPairs =
		mapMaybe
		(\(i,x) -> if x > lastUpdated then Just (i `mod` cwidth, i `div` cwidth) else Nothing)
		(indexed updateTimes)
putStrLn $ "querying pairs: " ++ show queryPairs
chunks <- concat <$> forM (group 8 queryPairs) (\pts ->
	Par.forM pts $ \pt -> do
		x <- doW3 (queryBlock callData pt)
		return $ either throw id x)
```

Using `updateTimes` we build a list of `(x,y)` indices of blocks we want to query. The queries are grouped into batches of 8 (using the helper function `group :: Int -> [a] -> [[a]]`) and made in parallel using `forM` from the `monad-parallel` package. The provider starts rejecting requests if too many are made at once and running them all sequentially is very slow. 8 runs fast enough and myetherapi/infura has yet to reject any of our requests.

Inside the `queryBlock` function, you'll see one more interesting conversion:
```haskell
queryBlock :: Call -> (Int, Int) -> Web3 ChunkInfo
queryBlock call (x,y) = do
    liftIO (putStrLn $ "fetching " ++ show x ++ " " ++ show y)
    (color, addr, val, lastBlock) <- getChunk call (fromIntegral x) (fromIntegral y)
    return ((x,y), runPut (abiPut color), addr, fromIntegral val, fromIntegral lastBlock)
```
All the ABI primitives can be converted to instances of `Get` and `Put` (from the `binary` package) using `abiGet` and `abiPut` respectively. `runPut (abiPut color)` converts the ABI primitive `ListN 32 (BytesN 32)` representing raw 8-bit image data into a `ByteString`. `Web3` is an instance of `MonadIO` so we also do some progress logging with `liftIO (putStrLn ...)`.

Later we'll make a <sub><sup><sub><sup>very inefficient</sup></sub></sup></sub> traversal on our 32-bit image represented as a `repa` array that converts and copies the raw 8-bit image data into the right place. All the necessary data for this operation is stored in `ChunkInfo`

```haskell
-- [(x,y), color, owner, price, lastUpdated]
type ChunkInfo = ((Int,Int), B.ByteString, Address, Int, Int)
```

Back to the `query` method. We still have some bookkeeping left to do. I won't go over this here since it's not web3 specific. The last step is to run the image conversion process described earlier and return the output:
```haskell
return $ updateImage chunks img
```
and that's it! I hope you enjoy writing your own web3 Haskell app as much as I did. Maybe give our smart contract a try.

The official bytecraft contract owns any ether you put in. If you want to support us, send ether to ***0x0D8A07e01Fd9b3DA4ce78109DBDFd385bE59bAE2***
