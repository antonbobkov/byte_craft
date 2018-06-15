var grid_w = 32;
var grid_h = 32;

var div_w = 32;
var div_h = 32;

function ind(x,y){return y*grid_w+x;}

function GlobalOnLoad(){
    $.getJSON('values.json', function(data) {
	GlobalOnLoad2(data);
    });
}

function GlobalOnLoad2(values){
    var meta = new Array(grid_w*grid_h);

    for(let m of values){
	meta[ind(m.pos_x, m.pos_y)] = m;
    }

    var bd = $('body');
    var main = $('<div>').width(div_w*grid_w).height(div_h*grid_h).addClass('main').appendTo(bd);

    $('<image src="1024.png">').appendTo(main);

    for(var x = 0; x < grid_w; ++x)
	for(var y = 0; y < grid_h; ++y){
	    var x_rel = x*div_w;
	    var y_rel = y*div_h;
	    var title = 'not initialized';
	    var m = meta[ind(x, y)];

	    if(m != undefined){
		title = '';
		for(k in m)
		    title += k + ': ' + m[k] + '\n';
	    }
	    
	    $('<div>', {title:title})
		.css({left:x_rel, top:y_rel}).width(div_w).height(div_h).addClass('inner').appendTo(main);
	}

    // $('[data-toggle="tooltip"]').tooltip();
}
