/**
 * Created by tmolnar on 2014.06.26..
 */
function showLoadingIndicator() {
    loadingIndicator = $('.loading-indicator');
    $('.loading-indicator img').css({'width':loadingIndicator.height()-10,
                                     'height':loadingIndicator.height()-10});
    loadingIndicator.show().stop().animate({'opacity':1}, 500);
}

function hideLoadingIndicator() {
    $('.loading-indicator').stop().animate({'opacity':0}, 500, function() {loadingIndicator.hide()});
}

function appendDynamicElements(currencies) {
    for(var i = 0; i < currencies.length; i++) {
        $('.base-select').
            append($('<option></option>').attr('value', currencies[i].currency).text(currencies[i].currency));
        $('.res-select').
            append($('<option></option>').attr('value', currencies[i].currency).text(currencies[i].currency));
    }
}