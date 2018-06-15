pragma solidity ^0.4.0;


contract LiterallyMinecraft {
  uint public constant global_width = 32;
  uint public constant global_height = 32;
  uint public constant global_length = global_width*global_height;
  
  uint public constant chunk_width = 32;
  uint public constant chunk_height = 32;
  uint public constant chunk_length = chunk_width*chunk_height;
  
  struct Chunk {
    bytes32[chunk_height] colors;
    
    address owner;
    uint value;

    uint lastUpdate;
  }

  uint public lastUpdate;
  
  Chunk[global_length] public screen;

  mapping(address => uint) public pendingReturns;
  
  constructor() public{
  }
     
  function getIndex(uint8 x, uint8 y) public pure returns(uint){
    return y*global_width+x;
  }

  function touch(uint8 x, uint8 y) internal{
    screen[getIndex(x,y)].lastUpdate = block.timestamp;
    lastUpdate = block.timestamp;
  }

  modifier withinBounds(uint8 x, uint8 y) {
    require(x >= 0 && x < global_width, "x out of range");
    require(y >= 0 && y < global_height, "y out of range");
    _;
  }
  
  modifier hasAccess(uint8 x, uint8 y) {
    Chunk storage p = screen[getIndex(x,y)];
    require(p.owner == 0 || msg.sender == p.owner, "access denied");
    _;
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
  
  
  function setColors(uint8 x, uint8 y, bytes32[chunk_height] clr) external
    withinBounds(x,y)
    hasAccess(x,y)
  {
    screen[getIndex(x,y)].colors = clr;
    touch(x,y);
  }

  function takeControl(uint8 x, uint8 y) external payable
    withinBounds(x,y)
  {
    Chunk storage p = screen[getIndex(x,y)];

    require(msg.value > p.value, "insufficient funds");
    releaseControlInt(x,y);

    p.owner = msg.sender;
    p.value = msg.value;
    touch(x,y);
  }
  
  function releaseControl(uint8 x, uint8 y) external
    withinBounds(x,y)    
  {
    Chunk storage p = screen[getIndex(x,y)];
    require(msg.sender == p.owner, "not controller");

    releaseControlInt(x,y);
    touch(x,y);
  }
  
  function releaseControlInt(uint8 x, uint8 y) internal
  {
    Chunk storage p = screen[getIndex(x,y)];
    pendingReturns[msg.sender] += p.value;
    p.owner = 0;
    p.value = 0;
  }
  
  function withdraw() external {
    uint amount = pendingReturns[msg.sender];
    require (amount > 0, "no funds to withdraw");
    
    pendingReturns[msg.sender] = 0;
    msg.sender.transfer(amount);    
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
