/**
 * Created by asher on 18/04/15.
 */
var _ = require('underscore');
var Promise = require('bluebird');

var s3 = require('../S3')();
s3.setup();

exports.uploadToS3 = function (req, res) {
    return new Promise(function (resolve, reject) {
        var files = _.toArray(req.files);
        var uploadedPromise = [];
        files.forEach(function (file) {
            uploadedPromise.push(s3.uploadFile(file.originalname, file.path));
        });

        var uploadedETags = [];
        Promise.all(uploadedPromise).then(function (uploadedResults) {
            uploadedResults.forEach(function (file) {
                uploadedETags.push(file.ETag);
            });

            resolve(uploadedETags);
        }).catch(function (error) {
            reject(error);
        });
    }).then(function (data) {
            console.log('File uploaded successfully!!!');
            res.send(data);
        });
};