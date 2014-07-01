/**
 * Created by tmolnar on 2014.06.27..
 */


function Currency(timeString) {
    var date = timeString;
    var currencies = [];
    
    this.getDate = function () {
        return date;
    };
    
    this.getCurrencies = function () {
        return currencies;
    };

    this.getRatioForCurrency = function(currency) {
        for(var i = 0; i < currencies.length; i++) {
            if (currency === currencies[i].currency)
                return currencies[i].ratio;
        }
    };
    
    this.addCurrency = function (currency, ratio) {
        currencies.push({
            'currency': currency,
            'ratio': parseFloat(ratio)
        });
    };
}
module.exports.Currency = Currency;

function History() {
    var ratioSeries = {};

    this.getRatioSeries = function () {
        var series = {};
        Object.keys(ratioSeries).forEach(function(key){
            series[key] = ratioSeries[key];
            series[key].reverse();
        });
        return series;
    };

    this.addCurrencyObject = function(currencyObject) {
        var epoch = epochForDate(currencyObject.getDate());
        var currencies = currencyObject.getCurrencies();
        for(var i = 0; i < currencies.length; i++) {
            var currency = currencies[i].currency;
            if(typeof ratioSeries[currency] != 'undefined')
                ratioSeries[currency].push({x:epoch, y:currencies[i].ratio});
            else {
                ratioSeries[currency] = [];
                ratioSeries[currency].push({x:epoch, y:currencies[i].ratio});
            }
        }
    };

    function epochForDate(dateAsYYYYMMDD) {
        return new Date(dateAsYYYYMMDD).getTime() / 1000;
    }
}

module.exports.History = History;
