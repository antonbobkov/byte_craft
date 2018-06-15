function GlobalOnLoad(){
    MetaMaskOnLoad(SetUpContract);

    // AttachReader($('#input').get(0), onImageLoad);
}

function SetUpContract(){    
    $('#main').show();
    $('#chunk-info-btn').click(GetChunkInfo);
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
	var value = result[2].c[0];
	var lastUpdate = result[3].c[0];

	var div = $('#chunk-info-div').html('');

	$('<p>').html('Address: ' + addr).appendTo(div);
	$('<p>').html('Value: ' + value).appendTo(div);
	$('<p>').html('Updated: ' + lastUpdate).appendTo(div);
    });
}



