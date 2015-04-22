/**
 * Created by asher on 06/04/15.
 */
var express = require('express');
var app = express();

var Promise = require('bluebird');

var cache = require('./cacheLayer')();
cache.setup();

var FSs3 = require('./fileSystemLayerS3')();
FSs3.setup();

var s3 = require('./S3')();
s3.setup();

var upload = require('./routes/upload');
var grades = require('./routes/grades');
var aws = require('./routes/aws');

var multer = require('multer');

app.use(multer({dest:'./uploads/'}));
app.use(express.static('public'));

app.get('/get/:key', function (req, res) {
    cache.getObject(req.params.key).then(function(valueFromCache) {
        res.send('Value: ' + valueFromCache + '!!!');
    })
});

app.get('/grades/calc', grades.calcGrades);
app.get('/aws/status', aws.awsStatus);
app.get('/aws/cache/clear', aws.clearCache);
app.get('/aws/cache/show', aws.showCache);

app.post('/upload', upload.uploadToS3);

var server = app.listen(3000, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);

});