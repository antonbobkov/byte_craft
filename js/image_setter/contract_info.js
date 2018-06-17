var contract_address_by_network = {
    //"3":  '0x25b1658683da464587039de4664b22cc7501b142', // Ropsten
    "4":  '0x193ee25da3c1f761010a70c8a2f893ecc531ea49', // Rinkeby
};

var contract_abi =
	[
	    {
		"constant": false,
		"inputs": [
		    {
			"name": "x",
			"type": "uint8"
		    },
		    {
			"name": "y",
			"type": "uint8"
		    },
		    {
			"name": "clr",
			"type": "bytes32[32]"
		    }
		],
		"name": "setColors",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	    },
	    {
		"inputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	    },
	    {
		"constant": true,
		"inputs": [
		    {
			"name": "x",
			"type": "uint8"
		    },
		    {
			"name": "y",
			"type": "uint8"
		    }
		],
		"name": "getChunk",
		"outputs": [
		    {
			"name": "",
			"type": "bytes32[32]"
		    },
		    {
			"name": "",
			"type": "address"
		    },
		    {
			"name": "",
			"type": "uint256"
		    },
		    {
			"name": "",
			"type": "uint256"
		    }
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	    },
	    {
		"constant": true,
		"inputs": [
		    {
			"name": "x",
			"type": "uint8"
		    },
		    {
			"name": "y",
			"type": "uint8"
		    }
		],
		"name": "getIndex",
		"outputs": [
		    {
			"name": "",
			"type": "uint256"
		    }
		],
		"payable": false,
		"stateMutability": "pure",
		"type": "function"
	    },
	    {
		"constant": true,
		"inputs": [],
		"name": "getUpdateTimes",
		"outputs": [
		    {
			"name": "",
			"type": "uint256[1024]"
		    }
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	    },
	    {
		"constant": true,
		"inputs": [],
		"name": "lastUpdate",
		"outputs": [
		    {
			"name": "",
			"type": "uint256"
		    }
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	    },
	    {
		"constant": true,
		"inputs": [
		    {
			"name": "",
			"type": "uint256"
		    }
		],
		"name": "screen",
		"outputs": [
		    {
			"name": "owner",
			"type": "address"
		    },
		    {
			"name": "value",
			"type": "uint256"
		    },
		    {
			"name": "lastUpdate",
			"type": "uint256"
		    }
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	    }
	];
