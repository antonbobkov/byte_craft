
var canvas1 = document.getElementById('canvas1');
var ctx1 = canvas1.getContext('2d');

var inputElement =  document.getElementById("input");
inputElement.addEventListener("change",
                              handleFiles, false);

function OnLoad(){
    errorLog('hi')
}

function handleFiles(e) {
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.addEventListener("load", 
                            processimage, false);
    reader.readAsArrayBuffer(file);
}

function processimage(e) {
    var buffer = e.target.result;
    var bitmap = getBMP(buffer);

    var stop = false
    
    if (bitmap.infoheader.biBitCount != 24){
	stop = true
	errorLog("Bit count needs to be 24 bit. Selected image is " + bitmap.infoheader.biBitCount + " bit.")
    }
    if (bitmap.infoheader.biWidth != 32 || bitmap.infoheader.biHeight != 32){
	stop = true
	errorLog("Image needs to be 32x32 pixels. Selected image is " + bitmap.infoheader.biWidth + "x" + bitmap.infoheader.biHeight + ".")
    }

    if (stop)
	return
    
    
    convertToImageData(bitmap);
}

function getBMP(buffer) {
    var datav = new DataView(buffer);
    var bitmap = {};
    bitmap.fileheader = {};
    bitmap.fileheader.bfType = 
        datav.getUint16(0, true);
    bitmap.fileheader.bfSize = 
        datav.getUint32(2, true);
    bitmap.fileheader.bfReserved1 =
        datav.getUint16(6, true);
    bitmap.fileheader.bfReserved2 =
        datav.getUint16(8, true);
    bitmap.fileheader.bfOffBits = 
        datav.getUint32(10, true);

    bitmap.infoheader = {};
    bitmap.infoheader.biSize = 
        datav.getUint32(14, true);
    bitmap.infoheader.biWidth = 
        datav.getUint32(18, true);
    bitmap.infoheader.biHeight =
        datav.getUint32(22, true);
    bitmap.infoheader.biPlanes = 
        datav.getUint16(26, true);
    bitmap.infoheader.biBitCount =
        datav.getUint16(28, true);
    bitmap.infoheader.biCompression = 
        datav.getUint32(30, true);
    bitmap.infoheader.biSizeImage = 
        datav.getUint32(34, true);
    bitmap.infoheader.biXPelsPerMeter = 
        datav.getUint32(38, true);
    bitmap.infoheader.biYPelsPerMeter = 
        datav.getUint32(42, true);
    bitmap.infoheader.biClrUsed = 
        datav.getUint32(46, true);
    bitmap.infoheader.biClrImportant = 
        datav.getUint32(50, true);
    var start = bitmap.fileheader.bfOffBits;
    bitmap.stride = Math.floor(
	(bitmap.infoheader.biBitCount *
	 bitmap.infoheader.biWidth+31)/32)*4;

    console.log(bitmap)
    
    bitmap.pixels = 
        new Uint8Array(buffer, start);
    return bitmap;
}


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

    var output = document.getElementById('output');     
    output.innerHTML += '['

    for (var y = 0; y < Height; ++y) {
	ln = '0x'
	for (var x = 0; x < Width; ++x) {
	    var index2 = x * 3 + stride * y;
	    var index1 = (x+Width*(Height-y-1))*4;
	    
	    data[index1] = bmpdata[index2 + 2];
	    data[index1 + 1] = bmpdata[index2 + 1];
	    data[index1 + 2] = bmpdata[index2];
	    data[index1 + 3] = 255;
	    
	    r = bmpdata[index2 + 2]
	    g = bmpdata[index2 + 1]
	    b = bmpdata[index2 + 0]
	    bt = byte_letters(color_convert(r, g, b))
	    
	    // console.log(r, g, b, bt);

	    ln += bt
	}
	// console.log(r, g, b, ln)
	output.innerHTML += '"' + ln + '"'
	if (y != Height - 1)
	    output.innerHTML += ', '
    }
    output.innerHTML += ']'
    
    ctx1.putImageData(imageData, 0, 0);
    
}

function errorLog(error){
    var el = $("<div></div>").addClass("error-message").text("Error: " + error).hide();
    $("#errors").append(el);
    el.fadeIn('slow');
    console.log("error");
}
