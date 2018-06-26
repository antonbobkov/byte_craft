pragma solidity ^0.4.0;

contract Stuff {
  function get1() public pure returns(uint32){return uint32(1293874192);}
  function get2() public pure returns(uint32[2]){return [uint32(1293874192), uint32(8782934)];}
  
  function pass0(uint32 x) public view returns(uint32){return x;}
  function pass1(uint32, uint32, uint32 x) public view returns(uint32){return x;}
  function pass2(uint32, uint32, uint32[2] x) public view returns(uint32[2]){return x;}
}
