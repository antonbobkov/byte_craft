pragma solidity ^0.4.0;

contract AFactory {
    event Print(string s);
    
    address[] newContracts;

    constructor () public {
        Contract cc = new Contract(5);
        cc.add();
        
        for(uint i = 0; i < 10; ++i){
            address newContract = new Contract(i);
            newContracts.push(newContract);
        }
        
        for(i = 0; i < 10; ++i){
            Contract c = Contract(newContracts[i]);
            c.add();
        }
        
        emit Print('hiasdf');
    } 
    
}

contract Contract {
    uint public Data;

    constructor (uint data) public {
        Data = data;
    }
    
    function add() public{
        Data *= 10;
    }
}