function GlobalOnLoad(){
    MetaMaskOnLoad();
    BmpReaderOnLoad();
}

function SetUpContract(){
    account = web3.eth.accounts[0];
    messageLog('<b>Your account:</b> ' + account);

    var contractAddress = '0x7DBBcE351ec9334fd378A6C5Ba2ac8Dc27ea4f5C';
    messageLog('<b>Contract address:</b> ' + selfLink('https://ropsten.etherscan.io/address/' + contractAddress));

    var abi = [{"constant":false,"inputs":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"}],"name":"releaseControl","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"pendingReturns","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"screen","outputs":[{"name":"owner","type":"address"},{"name":"value","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"},{"name":"clr","type":"bytes32[32]"}],"name":"setColors","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"global_length","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"global_width","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"chunk_width","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"}],"name":"getIndex","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"}],"name":"takeControl","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"}],"name":"getChunk","outputs":[{"name":"","type":"bytes32[32]"},{"name":"","type":"address"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"global_height","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"chunk_length","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"chunk_height","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}];

    myContractInstance = web3.eth.contract(abi).at(contractAddress);
    
    $("#send-btn").click(SetData);
    $('#main').show();
}

function SetData(){
    var x = parseInt($('#x').val());
    var y = parseInt($('#y').val());


    if(x == NaN || y == NaN || x < 0 || y < 0){
	errorLogClear();
	errorLog('incorrect coordinates x,y, should be non-negative numbers (' + x + ', ' + y + ')');
	return;
    }

    console.log(colorData);
        
    myContractInstance.setColors.sendTransaction(x, y, colorData, {from:account}, (error,result) => {
	console.log(error);
	console.log(result);

	if(error){
	    errorLog(error);
	    return;
	}
	
	var lnk = selfLink('https://ropsten.etherscan.io/tx/' + result);
	messageLog("transaction submitted " + lnk);
    });
    
}
