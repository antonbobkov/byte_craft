pragma solidity ^0.4.0;

contract SquareHype {
    string storedPotato;

    function setPotato(string x) public {
      storedPotato = x;
    }

    function getPotato() public view returns (string) {
      return storedPotato;      
    }
}
