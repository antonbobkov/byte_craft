var grid_w = 32;
var grid_h = 32;

var div_w = 32;
var div_h = 32;

function ind(x,y){return y*grid_w+x;}

function GlobalOnLoad(){
    var meta = new Array(grid_w*grid_h);

    for(let m of values){
	meta[ind(m.pos_x, m.pos_y)] = m;
    }

    var bd = $('body');
    var main = $('<div>').width(div_w*grid_w).height(div_h*grid_h).addClass('main').appendTo(bd);

    $('<image src="http://35.231.252.205/rb1024.png">').appendTo(main);

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

	    let addr = "../image_setter/ht_main.html?" + "x=" + x + "&" + "y=" + y;
	    
	    $('<div>', {title:title})
		.css({left:x_rel, top:y_rel})
		.width(div_w)
		.height(div_h)
		.addClass('inner')
		.click(function () {location.href = addr;})
		.appendTo(main);
	}

    // $('[data-toggle="tooltip"]').tooltip();
}
