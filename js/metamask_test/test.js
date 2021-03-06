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

    address = '0x7e47da30c521c5a25003190165ece8446d655b9a';
    abi =
	[
	    {
		"constant": false,
		"inputs": [
		    {
			"name": "d",
			"type": "bytes32[2]"
		    }
		],
		"name": "setData",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
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
		"name": "data",
		"outputs": [
		    {
			"name": "",
			"type": "bytes32"
		    }
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	    }
	]
    ;

    var contract = web3.eth.contract(abi);
    myContractInstance = contract.at(address);

    console.log('contract ' + myContractInstance);

    getData = new Array(2);

    var dv = $("<div>");
    
    var btn = $("<button>").text("Get").click(GetData);
    var pp = $("<p>").attr('id', 'get-output');

    dv.append(btn).append(pp);
    
    $('body').append(dv);

    var dv = $("<div>");
    
    var inp = $("<input>").attr('id', 'set-input');
    var btn = $("<button>").text("Set").click(SetData);
    var pp = $("<div>").attr('id', 'set-output');

    dv.append(inp).append(btn).append(pp);
    
    $('body').append(dv);
    
}

function GetData(){
    for(var i = 0; i < getData.length; ++i){
	let i_ = i;
	myContractInstance.data.call(i_, (error,result) => {
	    console.log('get result ', i_,  error, result);
	    getData[i_] = result;
	    $('#get-output').text(getData);
	});
    }
}
function SetData(){
    var data = $('#set-input').val().split(',');
    data = data.map(s => web3.fromDecimal(s));
    console.log(data);
    $('#set-output').text('');
    $('#set-output').append($('<p>').text(data));
    
    myContractInstance.setData.sendTransaction(data,{from:account}, (error,result) => {
	var lnk = 'https://rinkeby.etherscan.io/tx/';
	
    	console.log('set result ', (error,result));
	$('#set-output').append($('<p>').text(error));

	lnk += result
	
	$('#set-output').append($('<a>').attr('href', lnk).text(lnk));
	
    });
    
}
