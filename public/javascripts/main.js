var response;
function fetchLatest() {
    showLoadingIndicator();
    $.ajax({
        url: '/feed',
        data: null,
        type: 'GET',
        dataType: 'json',
        success: function(json) {
            $.getScript('/javascripts/ui-util.js', function(){
                response = json;
                appendDynamicElements(json);
                hideLoadingIndicator();
            });
        },
        error: function(xhr, status) {
            alert('Please reload the page. There was an error');
        }
    });
}

function fetchHistory() {
    jQuery.ajax({
        url: '/history',
        data: null,
        type: 'GET',
        dataType: 'json',
        success: function(json) {
            var palette = new Rickshaw.Color.Palette({scheme: 'classic9'});

            var graph = new Rickshaw.Graph({
                element: document.getElementById('chart'),
                renderer: 'line',
                series: getSeriesForGraph(json, palette),
                width: 960,
                height: 500
            });
            graph.render();

            var hoverDetail = new Rickshaw.Graph.HoverDetail({
                graph: graph
            });
            
            var legend = new Rickshaw.Graph.Legend({
                graph: graph,
                element: document.getElementById('legend')
            });
            
            var shelving = new Rickshaw.Graph.Behavior.Series.Toggle({
                graph: graph,
                legend: legend
            });
            
            var axes = new Rickshaw.Graph.Axis.Time({
                graph: graph
            });
            axes.render();
        },
        error: function(xhr, status) {
            alert('Cannot generate chart');
        }
    });
}

function getRatioForCurrency(currency) {
    if(currency === 'EUR')
        return 1.0;
    for(var i = 0; i < response.length; i++) {
        if (response[i].currency === currency)
            return response[i].ratio;
    }
}

function validateMeasure(input) {
    if(input !== null) {
        if (input.length > 0) {
            if (!isNaN(input))
                return true;
        }
    }
    return false;
}

function exchange(measure, type1, type2) {
    if (validateMeasure(measure)) {
        if (type1 !== type2) {
            var ratio1 = getRatioForCurrency(type1);
            var ratio2 = getRatioForCurrency(type2);
            return parseInt(measure) * (ratio2 / ratio1);
        }
        else {
            alert('It doesn\'t make any sense!');
        }
    }
}

function getSeriesForGraph(data, palette) {
    var series = [];
    for(var key in data) {
        series.push({
            name: key,
            data: data[key],
            color: palette.color()
        });
    }
    return series;
}