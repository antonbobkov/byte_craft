var contract_address_by_network = {
    "3":  '0x7dbbce351ec9334fd378a6c5ba2ac8dc27ea4f5c',
};
var contract_abi = [{"constant":false,"inputs":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"}],"name":"releaseControl","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"pendingReturns","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"screen","outputs":[{"name":"owner","type":"address"},{"name":"value","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"},{"name":"clr","type":"bytes32[32]"}],"name":"setColors","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"global_length","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"global_width","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"chunk_width","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"}],"name":"getIndex","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"}],"name":"takeControl","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"}],"name":"getChunk","outputs":[{"name":"","type":"bytes32[32]"},{"name":"","type":"address"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"global_height","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"chunk_length","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"chunk_height","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}];

function GlobalOnLoad(){
    MetaMaskOnLoad(SetUpContract);

    AttachReader($('#input').get(0), onImageLoad);
    // AttachReader(document.getElementById('input'), onImageLoad);
}

function SetUpContract(){    
    $("#send-btn").click(SetData);
    $('#main').show();
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
    canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    
    var Width = bitmap.infoheader.biWidth;
    var Height = bitmap.infoheader.biHeight;
    var imageData = 
        ctx.createImageData(Width, Height);
    var data = imageData.data;
    var bmpdata = bitmap.pixels;
    var stride = bitmap.stride;

    console.log(Width);
    console.log(Height);

    var output = document.getElementById('main');
    colorData = [];

    for (var y = 0; y < Height; ++y) {
	bt_line = '0x';
	for (var x = 0; x < Width; ++x) {
	    var index2 = x * 3 + stride * y;
	    var index1 = (x+Width*(Height-y-1))*4;
	    
	    data[index1] = bmpdata[index2 + 2];
	    data[index1 + 1] = bmpdata[index2 + 1];
	    data[index1 + 2] = bmpdata[index2];
	    data[index1 + 3] = 255;
	    
	    r = bmpdata[index2 + 2];
	    g = bmpdata[index2 + 1];
	    b = bmpdata[index2 + 0];
	    bt = byte_letters(color_convert(r, g, b));
	    
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
