/**
 * Created by asher on 18/04/15.
 */
var _ = require('underscore');
var Promise = require('bluebird');

var s3 = require('../S3')();
s3.setup();

var fs = require('../fileSystemLayer')();
fs.setup();

exports.uploadToS3 = function (req, res) {
    // Send all file to S3.
    var files = _.toArray(req.files);
    var uploadedPromise = [];
    files.forEach(function (file) {
        uploadedPromise.push(s3.uploadFile(file.originalname, file.path));
    });

    var uploadedETags = [];
    Promise.all(uploadedPromise).then(function (uploadedResults) {
        // All files were uploaded to S3. We process the results and generate a response.
        uploadedResults.forEach(function (file) {
            uploadedETags.push(file.ETag);
        });

        // Clear the files from the servers' temp location.
        files.forEach(function(file) {
            fs.delFile(file.path);
        });

        res.send(uploadedETags);
    }).catch(function (error) {
        res.send(error);
    });
};