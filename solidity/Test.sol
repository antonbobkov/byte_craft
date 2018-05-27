pragma solidity ^0.4.0;

contract Stuff {
  uint constant m = 10;
  bytes b1;
  bytes1[32*m] b2;
  bytes32[m] b3;

  function create1() public{b1 = new bytes(320); for (uint i = 0; i < 32*m; ++i) b1[i] = byte(i);}
  function create2() public{for (uint i = 0; i < 32*m; ++i) b2[i] = byte(i);}
  function create3() public{for (uint i = 0; i < m; ++i) b3[i] = bytes32(i);}
  
  function get1(bytes a1) public{}
  function get2(bytes1[32*m] a2) public{}
  function get3(bytes32[m] a3) public{}

  function ret1() public returns(bytes){return b1;}
  function ret2() public returns(bytes1[32*m]){return b2;}
  function ret3() public returns(bytes32[m]){return b3;}

  function send(address a) public{
    Stuff s = Stuff(a);

    s.get1(b1);
    s.get2(b2);
    s.get3(b3);
  }

}

contract Stuff2 {
  uint constant m = 10;
  bytes b1;
  bytes1[32*m] b2;
  bytes32[m] b3;
  address a;

  //constructor(address a_){a = a_; create1(); create2(); create3();}
  constructor(){}

  function create1() public{b1 = new bytes(320); for (uint i = 0; i < 32*m; ++i) b1[i] = byte(i);}
  function create2() public{for (uint i = 0; i < 32*m; ++i) b2[i] = byte(i);}
  function create3() public{
      bytes32[m] memory b4;
      for (uint i = 0; i < 32*m; ++i) b4[i%m] = bytes32(i);
      
  }
  
  function send1() public{Stuff s = Stuff(a); s.get1(b1);}
  function send2() public{Stuff s = Stuff(a); s.get2(b2);}
  function send3() public{Stuff s = Stuff(a); s.get3(b3);}
}
