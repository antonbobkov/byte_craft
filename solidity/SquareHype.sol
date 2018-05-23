pragma solidity ^0.4.0;

contract SquareHype {
  struct Pixel {
    uint8[3] rgb;

    address owner;
    uint value;
  }

  uint public constant width = 4;
  uint public constant height = 4;
  
  Pixel[width*height] public screen;

  mapping(address => uint) public pendingReturns;
     
  function getIndex(uint8 x, uint8 y) public pure returns(uint){
    return y*width+x;
  }

  function getPixel(uint8 x, uint8 y) external view returns(uint8[3], address, uint){
    Pixel storage p = screen[getIndex(x,y)];
    return (p.rgb, p.owner, p.value);
  }

  modifier hasAccess(uint8 x, uint8 y) {
    Pixel storage p = screen[getIndex(x,y)];
    require(p.owner == 0 || msg.sender == p.owner, "access denied");
    _;
  }
  
  function setColor(uint8 x, uint8 y, uint8[3] clr) external
    hasAccess(x,y)
  {
    screen[getIndex(x,y)].rgb = clr;
  }

  function takeControl(uint8 x, uint8 y) external payable{
    Pixel storage p = screen[getIndex(x,y)];

    require(msg.value > p.value, "insufficient funds");
    releaseControlInt(x,y);

    p.owner = msg.sender;
    p.value = msg.value;
  }
  
  function releaseControl(uint8 x, uint8 y) external
  {
    Pixel storage p = screen[getIndex(x,y)];
    require(msg.sender == p.owner, "not controller");

    releaseControlInt(x,y);
  }
  
  function releaseControlInt(uint8 x, uint8 y) internal
  {
    Pixel storage p = screen[getIndex(x,y)];
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
