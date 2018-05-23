pragma solidity ^0.4.0;

contract SquareHype {
  struct Pixel {
    uint8[3] rgb;
  }

  uint constant width = 4;
  uint constant height = 4;
  
  Pixel[width*height] screen;

  function getIndex(uint8 x, uint8 y) public pure returns(uint){
    return y*width+x;
  }

  function getColor(uint8 x, uint8 y) public view returns(uint8[3]){
    return screen[getIndex(x,y)].rgb;
  }
  
  function setColor(uint8 x, uint8 y, uint8[3] clr) public{
    screen[getIndex(x,y)].rgb = clr;
  }
}
