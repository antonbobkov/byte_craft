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
