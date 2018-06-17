pragma solidity ^0.4.0;


contract LiterallyMinecraft {
  uint constant global_width = 32;
  uint constant global_height = 32;
  uint constant global_length = global_width*global_height;

  uint constant chunk_width = 32*1; // must be multiple of 32
  uint constant chunk_height = 32;
  uint constant chunk_length = chunk_width*chunk_height;

  struct Chunk {
    bytes32[chunk_width*chunk_height/32] colors;

    address owner;
    uint value;

    uint lastUpdate;
  }

  uint public lastUpdate;

  Chunk[global_length] public screen;

  constructor() public{
  }

  function getIndex(uint8 x, uint8 y) public pure returns(uint) {
    return y*global_width+x;
  }

  function getChunk(uint8 x, uint8 y) external view
    withinBounds(x,y)
    returns(bytes32[chunk_height], address, uint, uint)
  {
    Chunk storage p = screen[getIndex(x,y)];
    return (p.colors, p.owner, p.value, p.lastUpdate);
  }

  function getUpdateTimes() external view
    returns(uint[global_length])
  {
    uint[global_length] memory ret;
    for(uint i = 0; i < global_length; ++i)
      ret[i] = screen[i].lastUpdate;
    return ret;
  }

  modifier withinBounds(uint8 x, uint8 y) {
    require(x >= 0 && x < global_width, "x out of range");
    require(y >= 0 && y < global_height, "y out of range");
    _;
  }

  modifier hasTheMoneys(uint8 x, uint8 y) {
    Chunk storage p = screen[getIndex(x,y)];
    require(msg.value > p.value, "insufficient funds");
    _;
  }

  function touch(uint8 x, uint8 y) internal {
    screen[getIndex(x,y)].lastUpdate = block.number;
    lastUpdate = block.number;
  }

  function setColors(uint8 x, uint8 y, bytes32[chunk_height] clr) external payable
    withinBounds(x,y)
    hasTheMoneys(x,y)
  {
    Chunk storage p = screen[getIndex(x,y)];
    uint refund = p.value;
    address oldOwner = p.owner;
    p.value = msg.value;
    p.owner = msg.sender;
    p.colors = clr;
    oldOwner.transfer(refund);
    touch(x,y);
  }
}

/* contract AFiller */
/* { */
/*   event bts(bytes32);  */
/*   uint public constant chunk_height = 32; */

/*   constructor(address a) public{ */
/*     LiterallyMinecraft lm = LiterallyMinecraft(a); */

/*     bytes32[chunk_height] memory clrs; */

/*     for(uint i = 0; i < chunk_height; ++i){ */
/*         for(uint j = 0; j < 32; ++j){ */
/*             bytes32 b = bytes32((i*32 + j) % 256); */
/*             clrs[i] |= (b << j*8); */
/*         } */
/*         emit bts(clrs[i]); */
/*     } */

/*     lm.setColors(1, 0, clrs); */
/*   } */
/* } */

/* contract CFiller{ */
/*   function f(bytes32) public{} */
/* } */


/* contract BFiller */
/* { */
/*   event bts(bytes32);  */
/*   uint public constant chunk_height = 32; */

/*   constructor(address a) public{ */
/*     LiterallyMinecraft lm = LiterallyMinecraft(a); */

/*     bytes32[chunk_height] memory clrs; */

/*     lm.setColors(2, 2, clrs); */
/*   } */

/* } */
