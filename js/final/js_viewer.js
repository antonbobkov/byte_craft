function GlobalOnLoad(){
    MetaMaskOnLoad(SetUpContract);

    // AttachReader($('#input').get(0), onImageLoad);
}

function SetUpContract(){
    $('#main').show();
    $('#chunk-info-btn').click(GetChunkInfo);
    $('#update-time-btn').click(GetLastUpdateTime);
    $('#update-all-btn').click(GetAllUpdateTimes);
    $('#balance-btn').click(GetBalance);
    $('#withdraw-btn').click(WithdrawBalance);
}

function WithdrawBalance(){
    myContractInstance.withdraw.sendTransaction({from:account}, logTransaction);
}

function GetBalance(){
    myContractInstance.pendingReturns.call(account, (error,result) =>{
	if(error){
	    errorLog(error);
	    return;
	}
	$('#balance-span').text(result.toNumber() + ' wei');
    });
}

function GetLastUpdateTime(){
    myContractInstance.lastUpdate.call((error,result) =>{
	if(error){
	    errorLog(error);
	    return;
	}
	$('#update-time-span').text(result.toNumber());
    });
}

function GetAllUpdateTimes(){
    $('#update-all-div').html('<i>... loading ... </i>');
    myContractInstance.getUpdateTimes.call((error,result) =>{
	if(error){
	    errorLog(error);
	    return;
	}
	var ul = $('<ul>');
	for (var y = 0; y < 32; ++y)
	    for (var x = 0; x < 32; ++x){
		var tm = result[x + 32*y].toNumber();
		if (tm != 0)
		    $('<li>').html(x + ', ' + y + ': ' + tm).appendTo(ul);
	    }

	$('#update-all-div').html('').append(ul);
    });
}
function GetChunkInfo(){
    var x = parseInt($('#x').val());
    var y = parseInt($('#y').val());


    if(x == NaN || y == NaN || x < 0 || y < 0){
	errorLogClear();
	errorLog('incorrect coordinates x,y, should be non-negative numbers (' + x + ', ' + y + ')');
	return;
    }

    $('#chunk-info-div').html('<i>... loading ... </i>');

    myContractInstance.getChunk.call(x, y, (error,result) =>{
	console.log(error);
	console.log(result);

	if(error){
	    errorLog(error);
	    return;
	}

	var addr = result[1];

	if(addr == account){
	    addr = '<span style="color:green; font-weight: bold">' + addr + '</span>';
	}

	var value = result[2].toNumber();
	var value_mil = web3.fromWei(value, 'milli');
	var value_eth = web3.fromWei(value, 'ether');
	var lastUpdate = result[3].toNumber();

	var div = $('#chunk-info-div').html('');

	var cv = $('<canvas>')
		.attr('width', 32)
		.attr('height', 32)
		.appendTo(div);

	loadByteImageToCanvas(result[0], cv.get(0));


	$('<p>').html('Address: ' + addr).appendTo(div);
	$('<p>').html('Value (wei): ' + value).appendTo(div);
	// $('<p>').html('Value (milli): ' + value_mil).appendTo(div);
	$('<p>').html('Value (ether): ' + value_eth).appendTo(div);
	$('<p>').html('Updated: ' + lastUpdate).appendTo(div);

	if(result[1] == account){
	    $('<button>')
		.text('Release Control')
		.click(function() {myContractInstance.releaseControl.sendTransaction(x, y, {from:account}, logTransaction);} )
		.appendTo(div);
	}
	else{
	    var value_eth_pp = web3.fromWei(value + 1, 'ether');

	    var p = $('<p>').text('Take control: ').appendTo(div);
	    $('<input>')
		.val(value_eth_pp)
		.attr('id', 'take-control-input')
		.appendTo(p);
	    $('<span>')
		.text(' (ether) ')
		.appendTo(p);
	    $('<button>')
		.text('Pay')
		.click(function() {
		    val_eth = web3.toWei($('#take-control-input').val(), 'ether');
		    myContractInstance.takeControl.sendTransaction(x, y, {from:account, value:val_eth}, logTransaction);
		} )
		.appendTo(p);
	}
    });
}
