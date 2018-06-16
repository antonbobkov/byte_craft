function errorLogAppend(error){
    var el = $("<div>").addClass("error-message").html(error).hide();
    $("#errors").append(el);
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
    
    $('#messages').animate({scrollTop: $('#messages').get(0).scrollHeight}, 2000);
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
