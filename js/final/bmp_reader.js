function letter(num){
    arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f'];
    return arr[num] + '';
}

function byte_letters(num){
    return letter(num >> 4) + letter(num % 16);
}

function color_convert(r, g, b){
    r = Math.floor(r/256*8);
    g = Math.floor(g/256*8);
    b = Math.floor(b/256*4);

    return (r << 5) + (g << 2) + b;
}

function colors_from_byte(bt){
    var b = bt & 3;
    var g = (bt >> 2) & 7;
    var r = (bt >> 5);

    b = b / 3 * 255;
    g = g / 7 * 255;
    r = r / 7 * 255;

    return {r:r, g:g, b:b};
}

function AttachReader(element, onImageLoad){
    element.addEventListener("change",
			     function(e) {
				 handleFiles(e, onImageLoad);
			     }
			     , false);    
}

function handleFiles(e, onImageLoad) {
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.addEventListener("load",
			     function(e) {
				 getBMP(e, onImageLoad);
			     }
			    , false);
    reader.readAsArrayBuffer(file);
}

function getBMP(e, onImageLoad) {
    var buffer = e.target.result;
    
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
    
    bitmap.pixels = 
        new Uint8Array(buffer, start);

    bitmap.getPixel = function(x,y){
	var index = x * 3 + bitmap.stride * y;

	var ret = {};
	ret.r = bitmap.pixels[index + 2];
	ret.g = bitmap.pixels[index + 1];
	ret.b = bitmap.pixels[index + 0];

	return ret;
    };

    onImageLoad(bitmap);
}

function loadByteImageToCanvas(image, canvas1) {
    var Height = image.length;
    var Width = (image[0].length - 2)/2;

    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    var imageData = ctx.createImageData(Width, Height);
    var data = imageData.data;

    for (var y = Height-1; y >= 0; --y) {
	for (var x = 0; x < Width; ++x) {
	    
	    var index1 = (x+Width*y)*4;

	    var bt = parseInt(image[y].substring(2 + x*2, 2 + x*2 + 2), 16);

	    var clr = colors_from_byte(bt);
	    
	    data[index1] = clr.r;
	    data[index1 + 1] = clr.g;
	    data[index1 + 2] = clr.b;
	    data[index1 + 3] = 255;
	}
    }
    
    var ctx1 = canvas1.getContext('2d');
    ctx1.putImageData(imageData, 0, 0);
}
