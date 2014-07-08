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
                $('#chart_container').hide();
                $('#load_chart_button').removeAttr('disabled');
            });
        },
        error: function(xhr, status) {
            alert('Please reload the page. There was an error');
        }
    });
}

function fetchHistory() {
    var baseCurrency = $('.base-select').val();
    var resCurrency = $('.res-select').val();
    jQuery.ajax({
        url: '/history',
        data: null,
        type: 'GET',
        dataType: 'json',
        success: function(json) {
            $('#chart_container').remove();
            var chartContainer = getChartDOM();
            $('.container').append(chartContainer);
            
            var palette = new Rickshaw.Color.Palette({scheme: 'munin'});

            var graph = new Rickshaw.Graph({
                element: document.getElementById('chart'),
                renderer: 'line',
                series: getSeriesForGraph(json, palette),
                width: 960,
                height: 500
            });
            
            //console.log(graph.series);
            for(var i = 0; i < graph.series.length; i++) {
                if (graph.series[i].name === baseCurrency || graph.series[i].name === resCurrency) {
                    graph.series[i].enabled = true;
                }
                else {
                    graph.series[i].disabled = true;
                }
                graph.update();
            }
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
            
            var yAxis = new Rickshaw.Graph.Axis.Y({
                graph: graph,
                orientation: 'left',
                tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
                element: document.getElementById('y_axis')
            });
            yAxis.render();
            $('#chart_container').show();
            $('#load_chart_button').attr('disabled', 'disabled');
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

function getChartDOM() {
    var chartContainer = $('<div></div>');
    chartContainer.addClass('hidden');
    chartContainer.attr('id', 'chart_container');
    
    var chartDiv = $('<div></div>');
    chartDiv.addClass('rickshaw_graph');
    chartDiv.attr('id', 'chart');
    
    var detailDiv = $('<div></div>');
    detailDiv.addClass('detail');
    chartDiv.append(detailDiv);
    
    var legendContainer = $('<div></div>');
    legendContainer.attr('id', 'legend_container');
    
    var smootherDiv = $('<div></div>');
    smootherDiv.attr('id', 'smoother');
    smootherDiv.attr('title', 'Smoothing');
    
    var legendDiv = $('<div></div>');
    legendDiv.attr('id', 'legend');
    legendDiv.addClass('rickshaw_legend');
    
    legendContainer.append(smootherDiv);
    legendContainer.append(legendDiv);
    
    var sliderDiv = $('<div></div>');
    sliderDiv.attr('id', 'slider');

    chartContainer.append(chartDiv);
    chartContainer.append(legendContainer);
    chartContainer.append(sliderDiv);
    
    return chartContainer;
}