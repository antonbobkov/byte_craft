var account;
var networkWebSite;
var myContractInstance;
var contractAddress;

function GetNetworkName(netId){
    var network_names = {
	"1":  'Main network',
	"2":  'deprecated Morden test network',
	"3":  'Ropsten test network',
	"4":  'Rinkeby test network',
	"42": 'Kovan test network',
        "19": 'Thunder test network',
    };

    if (netId in network_names)
	return network_names[netId];
    else
	return 'Unknown network (id: ' + netId + ')';
}

function GetNetworkWebSite(netId){
    var network_web_sites = {
	"1":  'https://etherscan.io/',
	"3":  'https://ropsten.etherscan.io/',
	"4":  'https://rinkeby.etherscan.io/',
        "19": 'http://34.212.240.178:8545'
    };

    if (netId in network_web_sites)
	return network_web_sites[netId];
    else
	return 'unknown website';
}

function logTransaction(error, result){
    console.log(error);
    console.log(result);

    if(error){
	errorLog(error);
	return;
    }

    var lnk = selfLink(networkWebSite + 'tx/' + result);
    messageLog("Transaction submitted: " + lnk);
}

function MetaMaskOnLoad(fnNext, forceNetId=undefined) {
    if (typeof web3 !== 'undefined') {
	web3 = new Web3(web3.currentProvider);

	messageLog("MetaMask successfully detected.");

	web3.version.getNetwork((err, netId) => {

	    if(err){
		errorLog(err);
		return;
	    }

	    messageLog('<b>Network:</b> ' + GetNetworkName(netId));

	    if(forceNetId !== undefined && forceNetId != netId){
		errorLog("Please switch metamask network to " + GetNetworkName(forceNetId) + ", and reload the page.");
		return;
	    }

	    if (!(netId in contract_address_by_network))
	    {
		var msg = GetNetworkName(netId) + ' is not supported. Switch networks and reload the page. Supported networks: ';
		var lst = $('<ul>');
		for (var key in contract_address_by_network)
		    $('<li>').text(GetNetworkName(key)).appendTo(lst);
		msg += jqGetHtml(lst);

		errorLog(msg);
		return;
	    }

	    account = web3.eth.accounts[0];

	    messageLog('<b>Your account:</b> ' + account + " (if you change it, reload the webpage)");

	    networkWebSite = GetNetworkWebSite(netId);

	    contractAddress = contract_address_by_network[netId];
	    var contractLink = networkWebSite + 'address/' + contractAddress;

	    messageLog('<b>Contract address:</b> ' + selfLink(contractLink));

	    myContractInstance = web3.eth.contract(contract_abi).at(contractAddress);

	    fnNext();
	});
    } else {
	errorLog("No MetaMask found! MetaMask is required for this webpage to work. Install MetaMask browser add-on here: " +
		   selfLink('https://metamask.io/'));
	return;

    }
}
