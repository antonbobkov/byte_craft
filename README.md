# BYTECRAFT
[Bytecraft](https://bytecraft.club) is a smart contract where users can purchase 32x32 8-bit blocks representing images in 32x32 grid. Bytecraft is currently on Ethereum Main Net. The official app is hosted @ [bytecraft.club](https://bytecraft.club)

## Contract
The contract has only one external payable function:
```solidity
function setColors(uint8 x, uint8 y, bytes32[chunk_height] clr) external payable
	withinBounds(x,y)
	hasTheMoneys(x,y)
```

This function claims a 32x32 8-bit pixel chunk in the 32x32 grid and the image data. In order to claim it, the amount paid needs to exceed the amount that was last paid on the chunk (starting at 0). If another user takes control of this chunk, the last user will be refunded the ether they staked. The contract owns all staked ether and the only way to get it back is if someone posts a larger stake :).

The main viewing function is:
```solidity
function getChunk(uint8 x, uint8 y) external view
	withinBounds(x,y)
	returns(bytes32[chunk_height], address, uint, uint)
```

This returns the image data as well as the owner, how much they staked, and the block number this transaction happened. There are also some viewing functions for checking timestamps so the image generator does not need to poll the entire image every time.

## Image Generator
The image is generated using the Haskell [web3 package](https://hackage.haskell.org/package/web3). Please see this [README](https://github.com/antonbobkov/city_building_game_v1/blob/master/hs/minecraft-viewer/README.md) for a walkthrough on how it's done. tldr; Thanks to the awesom ABI interfaces generated with Template Haskell, the web3 package for Haskell is a fantastic choice for writing dapps. We have a server that runs the generator every 10 minutes and serves the image as well as additional meta data.

## App
We wrote a js web3 app for interacting with the smart contract. The app displays the image made by the image generator and overlays a hoverable grid displaying meta data of each chunk. Clicking on the square takes you to the setter page. It also refreshes the tile locally if you don't want to wait 10 minutes.
