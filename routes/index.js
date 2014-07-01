var express = require('express');
var router = express.Router();
var request = require('request');
var Currency = require('../models/feed.js').Currency;
var History = require('../models/feed.js').History;
var cache = require('memory-cache');
var xml2js = require('xml2js');
var winston = require('winston');

/* GET home page. */
router.get('/', function(req, res) {
    winston.debug('Rendering index page');
    res.render('index');
});

router.get('/feed', function(req, res){
    request('http://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml', function(error, response, body){
        if(!error && response.statusCode == 200) {
            var parser = new xml2js.Parser();
            var history = new History();
            parser.parseString(body, function(error, result) {
                var cubes = result['gesmes:Envelope']['Cube'][0]['Cube'];
                var latest = new Currency(cubes[0]['$']['time']);
                var latestCube = cubes[0]['Cube'];
                for(var a = 0; a < latestCube.length; a++) {
                    latest.addCurrency(latestCube[a]['$']['currency'], latestCube[a]['$']['rate']);
                }
                cache.put('latest', latest);
                winston.log('Latest entry added into cache');
                for (var i = 1; i < cubes.length; i++) {
                    var currency = new Currency(cubes[i]['$']['time']);
                    var cube = cubes[i]['Cube'];
                    for (var j = 0; j < cube.length; j++) {
                        currency.addCurrency(cube[j]['$']['currency'], cube[j]['$']['rate']);
                    }
                    currency.addCurrency('EUR', 1.0);
                    history.addCurrencyObject(currency);
                    cache.put(currency.getDate(), currency, 24 * 3600 * 1000);
                }
            });
            cache.put('history', history.getRatioSeries());
            winston.debug('All of the parsed feed stored in cache');
            //console.log(cache.get('history').getRatiosSeries());
            //console.log(cache.get('latest').getCurrencies());
            winston.debug('Latest currencies with rates sent to the client');
            res.send(JSON.stringify(cache.get('latest').getCurrencies()));
        }
    });
});

router.get('/chart', function(req, res) {
    //console.log(cache.get('history'));
    winston.debug('Rendering chart page');
    res.render('chart');
});

router.get('/history', function(req, res) {
    //console.log(cache.get('history').getRatiosSeries());
    winston.debug('Sending history object to client');
    res.send(JSON.stringify(cache.get('history')));
});

//TODO
//Implement a logging service to store client-side events at the server

module.exports = router;
