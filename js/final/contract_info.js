var contract_address_by_network = {
    "1":  '0x86c7989ABC839ddcE2e77f71f979a3F42a0F0420', // Main
    //"3":  '0x25b1658683da464587039de4664b22cc7501b142', // Ropsten
    "4":  '0x63c7207f1fee3f6c6ba65d2d5a08ef91e7c712b7', // Rinkeby
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
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "lastUpdateByChunk",
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
		"inputs": [],
		"name": "lastUpdateOverall",
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
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}
]
