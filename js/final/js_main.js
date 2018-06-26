var grid_w = 32;
var grid_h = 32;

var div_w = 32;
var div_h = 32;

function ind(x,y){return y*grid_w+x;}

function loadMainImage(){
    var img = new Image();
    img.src = "http://35.231.252.205/rb1024.png";
    img.onload = function(){
	
	var canvas = $('<canvas class="big" id="main-canvas">')
		.appendTo($('#main_img')).get(0);
	var ctx = canvas.getContext('2d');

	var Width = img.width;
	var Height = img.height;
	
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img,0,0);
    };
}

function GlobalOnLoad(){
    // MMSK_GlobalOnLoad();
    // test();
    var meta = new Array(grid_w*grid_h);

    for(let m of values){
	meta[ind(m.pos_x, m.pos_y)] = m;
    }

    var bd = $('#img');
    var main = $('<div id="main_img">').width(div_w*grid_w).height(div_h*grid_h).addClass('main').appendTo(bd);

    loadMainImage();

    // $('<image src="http://35.231.252.205/rb1024.png">').appendTo(main);

    for(var x = 0; x < grid_w; ++x)
	for(var y = 0; y < grid_h; ++y){
	    var x_rel = x*div_w;
	    var y_rel = y*div_h;
	    var title = 'not initialized';
	    var m = meta[ind(x, y)];

	    if(m != undefined){
		title = '';
		title += 'x: ' + m['pos_x'] + '\n';
		title += 'y: ' + m['pos_y'] + '\n';
		title += 'value: ' + m['cost'] + '\n';
	    }

	    let x_ = x;
	    let y_ = y;
	    
	    $('<div>', {title:title})
		.css({left:x_rel, top:y_rel})
		.width(div_w)
		.height(div_h)
		.addClass('inner')
		.click(function () {OnClickChunk(x_,y_);})
		.appendTo(main);
	}
}

var metamask_loaded = false;

function OnClickChunk(x,y){
    $('#x').val(x);
    $('#y').val(y);
    
    if (metamask_loaded == false){
	MMSK_GlobalOnLoad();
    }
    else{
	GetChunkInfo();
    }
    document.body.scrollTop = document.documentElement.scrollTop = 0;
}


function MMSK_GlobalOnLoad(){
    metamask_loaded = true;
    // var GET = getGET();

    var forceNetId = undefined;
    
    // if('netId' in GET)
    // 	forceNetId = GET['netId'];
    // else
    // 	forceNetId = undefined;
    
    MetaMaskOnLoad(SetUpContract, forceNetId);

    // AttachReader($('#input').get(0), onImageLoad);
    AttachReader($('#input').get(0), afterLoad);
    
    // AttachReader(document.getElementById('input'), onImageLoad);
}

function SetUpContract(){    

    $('#main').show();

    $('#chunk-info-btn').click(GetChunkInfo);    
    $('#upload-btn').click(SetColors);
    // $('#upload-btn').click(Kappa);

    // var GET = getGET();

    // if('x' in GET){
    // 	$('#x').val(GET['x']);
    // 	$('#y').val(GET['y']);
    // }

    GetChunkInfo();
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

var colorData;

function afterLoad(colorData_){
    colorData = colorData_;
    
    loadByteImageToCanvas(colorData, $('#canvas1').get(0));

    $('#upload-btn').prop('disabled', false);
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

    convertToImageData(bitmap);
    
    loadByteImageToCanvas(colorData, $('#canvas1').get(0));

    $('#upload-btn').prop('disabled', false);
}


function convertToImageData(bitmap) {
    var Width = bitmap.infoheader.biWidth;
    var Height = bitmap.infoheader.biHeight;

    colorData = [];

    for (var y = Height-1; y >= 0; --y) {
	var bt_line = '0x';
	for (var x = 0; x < Width; ++x) {
	    var index1 = (x+Width*(Height-y-1))*4;

	    var clr = bitmap.getPixel(x, y);
	    
	    var bt = byte_letters(color_convert(clr.r, clr.g, clr.b));
	    
	    bt_line += bt;
	}
	colorData.push(bt_line);
    }
    
}


function SetColors(){
    var x = parseInt($('#x').val());
    var y = parseInt($('#y').val());


    if(x == NaN || y == NaN || x < 0 || y < 0){
    	errorLog('incorrect coordinates x,y, should be non-negative numbers (' + x + ', ' + y + ')');
    	return;
    }

    console.log(colorData);
        
    var value = $('#upload-input').val();
    myContractInstance.setColors.sendTransaction(x, y, colorData, {value:value, from:account}, logTransaction);
    
    // for (var x = 20; x < 30; ++x)
    // 	for (var y = 20; y < 30; ++y)
    // 	    myContractInstance.setColors.sendTransaction(x, y, colorData, {from:account}, logTransaction);
}


function Kappa(){
    var verySecretPrivateKey = 'd4aa00d0e843c983caeca7b68fbdc0b1770d5a8db82edd86d79c9bcc95865579';

    var tr_arr = [];
    for (var y = 0; y < 32; ++y)
	for (var x = 0; x < 32; ++x)
	    tr_arr.push({x:x, y:y});
    console.log(tr_arr);

    var nonce;
    
    console.log(colorData);
    var fn_gogogo = function(){
	if(tr_arr.length == 0){
	    return;
	}

	var coord = tr_arr[0];
	tr_arr.splice(0, 1);

	var s = colorData[coord.y].substring(2+coord.x*2, 2+coord.x*2+2);
	s = '0x' + s.repeat(32);
	var a = new Array(32).fill(s);
	
	var data = myContractInstance.setColors.getData(coord.x, coord.y, a);

	var tx = new ethereumjs.Tx({
	    nonce: nonce,
	    gasPrice: web3.toHex(web3.toWei('20', 'gwei')),
	    gasLimit: 1000000,
	    to: contractAddress,
	    value: 1,
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

    $('#chunk-info-div').show();
    $('#chunk-info-div').html('<i>... loading ... </i>');

    myContractInstance.getChunk.call(x, y, (error,result) =>{
	console.log(error);
	console.log(result);

	if(error){
	    $('#chunk-info-div').hide();
	    errorLog(error);
	    return;
	}

	var addr = result[1];
	var value = result[2].toNumber();
	var value_eth = web3.fromWei(value, 'ether');

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
	loadByteImageToCanvas(result[0], $('#main-canvas').get(0), x*32, y*32);
	
	$('<span>').html('Last uploader: ' + addr).appendTo(p);
	$('<br>').appendTo(p);
	
	$('<span>').html('Current value (wei): ' + value).appendTo(p);
	$('<br>').appendTo(p);
	
	$('<span>').html('Current value (ether): ' + value_eth).appendTo(p);
	$('<br>').appendTo(p);
	
	$('#upload-div').show();

	var val_one = (result[2].plus(web3.toBigNumber(1))).toString();
	
	$('#upload-input').val(val_one);
    });
}
