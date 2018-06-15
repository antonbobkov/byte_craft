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
	errorLogClear();
	errorLog('incorrect coordinates x,y, should be non-negative numbers (' + x + ', ' + y + ')');
	return;
    }

    console.log(colorData);
        
    myContractInstance.setColors.sendTransaction(x, y, colorData, {from:account}, logTransaction);    
}
