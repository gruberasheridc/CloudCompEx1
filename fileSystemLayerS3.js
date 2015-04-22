/**
 * Created by asher on 07/04/15.
 */
module.exports = function () {
    var Promise = require('bluebird');
    var s3;
    var bucketName = 'cloudcomp.agruber';

    function setup() {
        var AWS = require('aws-sdk');
        AWS.config.region = 'eu-west-1';
        s3 = Promise.promisifyAll(new AWS.S3());
    }

    function getFile(key) {
        var params = {Bucket: bucketName, Key: key};
        return s3.getObjectAsync(params);
    }

    function getFiles() {
        var params = {Bucket: bucketName};
        return s3.listObjectsAsync(params);
    }

    return {
        setup : setup,
        getFile : getFile,
        getFiles : getFiles
    };

};