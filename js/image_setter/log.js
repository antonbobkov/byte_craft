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
    $("#messages").append($("<div>").addClass("message").html(msg));
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
