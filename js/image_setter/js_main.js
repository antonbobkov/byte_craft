function GlobalOnLoad(){
    MetaMaskOnLoad(SetUpContract);

    AttachReader($('#input').get(0), onImageLoad);
    // AttachReader(document.getElementById('input'), onImageLoad);
}

function SetUpContract(){    
    $("#send-btn").click(SetData);
    // $("#kappa-btn").click(Kappa);
    $('#main').show();

    $('#chunk-info-btn').click(GetChunkInfo);
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

function onImageLoad(bitmap) {
    errorLogClear();

    var stop = false;
    
    if (bitmap.infoheader.biBitCount != 24){
	stop = true;
	errorLogAppend("Bit count needs to be 24 bit. Selected image is " + bitmap.infoheader.biBitCount + " bit.");
    }
    if (bitmap.infoheader.biWidth != 32 || bitmap.infoheader.biHeight != 32){
	stop = true;
	errorLogAppend("Image needs to be 32x32 pixels. Selected image is " + bitmap.infoheader.biWidth + "x" + bitmap.infoheader.biHeight + ".");
    }

    if (stop)
	return;

    $('#send-div').show();
    
    convertToImageData(bitmap);
}

var colorData = [];

function convertToImageData(bitmap) {
    
    var Width = bitmap.infoheader.biWidth;
    var Height = bitmap.infoheader.biHeight;

    canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    ctx.scale(2,2);
    var imageData = ctx.createImageData(Width, Height);
    var data = imageData.data;

    console.log(Width);
    console.log(Height);

    var output = document.getElementById('main');
    colorData = [];

    for (var y = Height-1; y >= 0; --y) {
	bt_line = '0x';
	for (var x = 0; x < Width; ++x) {
	    var index1 = (x+Width*(Height-y-1))*4;

	    clr = bitmap.getPixel(x, y);
	    
	    data[index1] = clr.r;
	    data[index1 + 1] = clr.g;
	    data[index1 + 2] = clr.b;
	    data[index1 + 3] = 255;
	    
	    bt = byte_letters(color_convert(clr.r, clr.g, clr.b));
	    
	    // console.log(r, g, b, bt);

	    bt_line += bt;
	}
	// console.log(r, g, b, ln)
	colorData.push(bt_line);
    }
    
    canvas1 = document.getElementById('canvas1');
    ctx1 = canvas1.getContext('2d');
    
    ctx1.putImageData(imageData, 0, 0);
}


function SetData(){
    var x = parseInt($('#x').val());
    var y = parseInt($('#y').val());


    if(x == NaN || y == NaN || x < 0 || y < 0){
    	errorLog('incorrect coordinates x,y, should be non-negative numbers (' + x + ', ' + y + ')');
    	return;
    }

    console.log(colorData);
        
    myContractInstance.setColors.sendTransaction(x, y, colorData, {from:account}, logTransaction);
    
    // for (var x = 20; x < 30; ++x)
    // 	for (var y = 20; y < 30; ++y)
    // 	    myContractInstance.setColors.sendTransaction(x, y, colorData, {from:account}, logTransaction);
}


function Kappa(){
    var verySecretPrivateKey = 'd4aa00d0e843c983caeca7b68fbdc0b1770d5a8db82edd86d79c9bcc95865579';


    tr_arr = [];
    for (var x = 20; x < 30; ++x)
	for (var y = 20; y < 30; ++y)
	    tr_arr.push({x:x, y:y});
    console.log(tr_arr);

    var nonce;
    
    var fn_gogogo = function(){
	if(tr_arr.length == 0){
	    return;
	}

	var coord = tr_arr[0];
	tr_arr.splice(0, 1);
	
	var data = myContractInstance.setColors.getData(coord.x, coord.y, colorData);

	var tx = new ethereumjs.Tx({
	    nonce: nonce,
	    gasPrice: web3.toHex(web3.toWei('20', 'gwei')),
	    gasLimit: 1000000,
	    to: contractAddress,
	    value: 0,
	    data: data,
	});

	nonce = nonce + 1;
	
	tx.sign(ethereumjs.Buffer.Buffer.from(verySecretPrivateKey, 'hex'));

	var raw = '0x' + tx.serialize().toString('hex');

	console.log(coord, {nonce:nonce});
	
	web3.eth.sendRawTransaction(raw, function(error, result){
	    if(error){
		errorLog(error);
		return;
	    }

	    var lnk = selfLink(networkWebSite + 'tx/' + result);
	    messageLog("Transaction submitted: " + lnk);
	    
	    fn_gogogo();
	});

    };
    
    web3.eth.getTransactionCount(account, function (err, nonce_) {
	if(err){
	    errorLog(err);
	    return;
	}
	
	nonce = nonce_;
	
	fn_gogogo();
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

	var tr = $('<tr>').appendTo($('<table>').appendTo(div));
	var td1 = $('<td>').width(50).appendTo(tr);
	var td2 = $('<td>').appendTo(tr);
	

	var cv = $('<canvas>')
		.attr('width', 32)
		.attr('height', 32)
		.appendTo(td1);

	var p = $('<p>').appendTo(td2);

	loadByteImageToCanvas(result[0], cv.get(0));
	

	$('<span>').html('Address: ' + addr).appendTo(p);
	$('<br>').appendTo(p);
	
	$('<span>').html('Value (wei): ' + value).appendTo(p);
	$('<br>').appendTo(p);
	
	$('<span>').html('Value (ether): ' + value_eth).appendTo(p);
	$('<br>').appendTo(p);
	
	$('<span>').html('Updated: ' + lastUpdate).appendTo(p);
	$('<br>').appendTo(p);

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
