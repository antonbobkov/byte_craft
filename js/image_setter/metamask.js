
function NetworkName(netId){
    switch (netId) {
    case "1":
	return 'Main network';
    case "2":
	return 'deprecated Morden test network';
    case "3":
	return 'Ropsten test network';
    case "4":
	return 'Rinkeby test network';
    case "42":
	return 'Kovan test network';
    default:
	return 'unknown network.';
    }
}

function MetaMaskOnLoad() {
    if (typeof web3 !== 'undefined') {
	
	web3 = new Web3(web3.currentProvider);
	
	messageLog("MetaMask successfully detected.");
	
	
	web3.version.getNetwork((err, netId) => {
	    if(err){
		errorLog(err);
		return;
	    }

	    messageLog('<b>Network:</b> ' + NetworkName(netId));

	    if (netId != '3'){
		errorLog('Only Ropsten network is supported. Switch networks and reload the page.');
		return;
	    }

	    SetUpContract();
	    
	});
    } else {
	errorLog("No MetaMask found! MetaMask is required for this webpage to work. Install MetaMask browser add-on here: " +
		   selfLink('https://metamask.io/'));
	return;

	// web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/'));	
    }
    
    // console.log(web3);

    // web3.eth.getBlock(48, function(error, result){
    // 	if(!error)
    //         console.log(JSON.stringify(result));
    // 	else
    //         console.error(error);
    // })

    // runApp();


}

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
