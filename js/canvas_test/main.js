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

function GlobalOnLoad()
{
    var imageLoader = document.getElementById('imageLoader');
    imageLoader.addEventListener('change', handleImage, false);
}


function loadImageIntoArray(e, continueFn){
    var reader = new FileReader();
    reader.onload = function(event){
        var img = new Image();
        img.onload = function(){
	    var canvas = document.createElement("canvas");
	    var ctx = canvas.getContext('2d');

	    var Width = img.width;
	    var Height = img.height;
	    
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img,0,0);
	    
	    var imageData = ctx.getImageData(0,0,Width,Height);
	    var data = imageData.data;
	    
	    var colorData = [];
	    
	    for (var y = 0; y < 32; ++y) {
		var bt_line = '0x';
		for (var x = 0; x < 32; ++x) {

		    var clr = {};
		    if (x < Width && y < Height){		    
			var index1 = (x+Width*y)*4;

			clr.r = data[index1];
			clr.g = data[index1+1];
			clr.b = data[index1+2];
		    }
		    else{
			clr.r = 0;
			clr.g = 0;
			clr.b = 0;
		    }
		    
		    var bt = byte_letters(color_convert(clr.r, clr.g, clr.b));
		    
		    bt_line += bt;
		}
		colorData.push(bt_line);
	    }
	    // console.log(colorData);
	    continueFn(colorData);
        };
        img.src = event.target.result;
	// console.log(img.src);
    };
    reader.readAsDataURL(e.target.files[0]);
    // console.log(e.target.files[0]);
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
