function errorLogAppend(error){
    var el = $("<div>").addClass("error-message").html(error).hide();
    $("#errors").show().append(el);
    el.fadeIn('slow');
}

function errorLog(error){
    errorLogClear();
    errorLogAppend(error);
}

function errorLogClear(){
    $("#errors").text('');
}

function messageLog(msg){
    $("<span>").addClass("message").html(msg).appendTo($('#messages'));
    $('<br>').appendTo($('#messages'));
    
    $('#messages').show().animate({scrollTop: $('#messages').get(0).scrollHeight}, 500);
}

function messageLogClear(){
    $("#messages").text('');
}

function selfLink(ref){
    return "<a href='" + ref + "' target='_blank'>" + ref + "</a>";
}

function jqGetHtml(obj){
    return $('<div>').append(obj).html();
}

function getGET(){
    var parts = window.location.search.substr(1).split("&");
    var GET = {};
    for (var i = 0; i < parts.length; i++) {
	var temp = parts[i].split("=");
	GET[decodeURIComponent(temp[0])] = decodeURIComponent(temp[1]);
    }
    return GET;
}
