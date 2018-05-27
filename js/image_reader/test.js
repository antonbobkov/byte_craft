// function readSingleFile(evt) {
//     //Retrieve the first (and only!) File from the FileList object
//     var f = evt.target.files[0]; 

//     if (f) {
// 	var r = new FileReader();
// 	r.onload = function(e) { 
// 	    var contents = e.target.result;
//             alert( "Got the file.n" 
// 		   +"name: " + f.name + "n"
// 		   +"type: " + f.type + "n"
// 		   +"size: " + f.size + " bytesn"
// 		   + "starts with: " + contents.substr(1, contents.indexOf("n"))
// 		 );  
// 	}
// 	r.readAsText(f);
//     } else { 
// 	alert("Failed to load file");
//     }
// }

// document.getElementById('fileinput').addEventListener('change', readSingleFile, false);

var inputElement = document.getElementById("fileinput");
inputElement.addEventListener("change", handleFiles, false);

function handleFiles(e) { 
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.addEventListener("load", processimage, false);
    reader.readAsArrayBuffer(file);    
}

function processimage(e) { 
    var buffer = e.target.result; 
    var bitmap = getBMP(buffer); 
    var imageData = convertToImageData(bitmap);
    ctx1.putImageData(imageData, 0, 0);
}

