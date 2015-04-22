/**
 * Created by asher on 18/04/15.
 */

var s3 = require('../S3')();
s3.setup();

var cache = require('../cacheLayer')();
cache.setup();

exports.awsStatus = function (req, res) {
    s3.getEC2InstaneData()
        .then(function(data) {
            console.log('Data: ' + data);
            res.send(data);
        });
};

exports.clearCache = function (req, res) {
    cache.clearCache()
        .then(function(data) {
            console.log('Data: ' + data);
            res.send(data);
        });
};

exports.showCache = function (req, res) {
    cache.getValuesByKeyPattern("*")
        .then(function(data) {
            console.log('Data: ' + data);
            res.send(data);
        });
};