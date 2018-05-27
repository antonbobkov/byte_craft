window.addEventListener('load', function() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
	// Use Mist/MetaMask's provider
	web3 = new Web3(web3.currentProvider);
	console.log('success!')
	
	web3.version.getNetwork((err, netId) => {
	    switch (netId) {
	    case "1":
		console.log('This is mainnet')
		break
	    case "2":
		console.log('This is the deprecated Morden test network.')
		break
	    case "3":
		console.log('This is the ropsten test network.')
		break
	    case "4":
		console.log('This is the Rinkeby test network.')
		break
	    case "42":
		console.log('This is the Kovan test network.')
		break
	    default:
		console.log('This is an unknown network.')
	    }
	})

	account = web3.eth.accounts[0];
	console.log(account)

	
    } else {
	console.log('No MetaMask found!')

	web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/'));	
    }
    
    console.log(web3);

    // web3.eth.getBlock(48, function(error, result){
    // 	if(!error)
    //         console.log(JSON.stringify(result));
    // 	else
    //         console.error(error);
    // })

    runApp();


})

function runApp(){

    address = '0x79a2bc78604ea10366fd3846b8a60bef0256f73a';
    abi = [
	{
	    "constant": false,
	    "inputs": [
		{
		    "name": "x",
		    "type": "string"
		}
	    ],
	    "name": "setPotato",
	    "outputs": [],
	    "payable": false,
	    "stateMutability": "nonpayable",
	    "type": "function"
	},
	{
	    "constant": true,
	    "inputs": [],
	    "name": "getPotato",
	    "outputs": [
		{
		    "name": "",
		    "type": "string"
		}
	    ],
	    "payable": false,
	    "stateMutability": "view",
	    "type": "function"
	}
    ];

    contract = web3.eth.contract(abi);
    var myContractInstance = contract.at('0x79a2bc78604ea10366fd3846b8a60bef0256f73a');

    console.log('contract ' + myContractInstance);
    myContractInstance.getPotato.call((error,result) => {
	console.log('get result ' + result);
    });
    myContractInstance.setPotato.sendTransaction('potatos are great!',{from:account}, (error,result) => {
	console.log('set result ');
	console.log(result);
	console.log(error);
    });
    
}
