/**
 * Created by asher on 07/04/15.
 */
module.exports = function () {
    var Promise = require('bluebird');
    var AWS = require('aws-sdk');
    var s3;
    var bucketName = 'cloudcomp.agruber';

    function setup() {
        AWS.config.region = 'eu-west-1';
        s3 = new AWS.S3();
    }

    function getFile(key) {
        return new Promise(function(resolve, reject){
            var params = {Bucket: bucketName, Key: key, ResponseContentType : 'application/json'};
            s3.getObject(params, function(error, data) {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(data);
                }
            });
        });
    }

    function getFiles() {
        return new Promise(function (resolve, reject) {
            var params = {Bucket: bucketName};
            s3.listObjects(params, function (error, data) {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(data);
                }
            });
        });
    }

    function uploadFile(key, filepath) {
        var fs = require('fs');
        var stat = Promise.promisify(fs.stat);

        return Promise.bind(this)
            .then(function() { return stat(filepath); })
            .then(function(fileInfo) {
                var bodyStream = fs.createReadStream(filepath);
                return putObject(bucketName, key, bodyStream, fileInfo.size);
            });
    }

    function putObject (bucket, key, body, contentLength) {
        return new Promise(function(resolve, reject){
            var params = {
                Bucket: bucket,
                Key: key,
                Body: body,
                ContentLength: contentLength
            };

            s3.putObject(params, function(error, data) {
                if (error) { reject(error); }
                else { resolve(data); }
            });
        });
    }

    function getEC2InstanceData() {
        return new Promise(function(resolve, reject){
            console.log("\n\nLoading handler\n\n");
            var ec2 = new AWS.EC2();
            ec2.describeInstances(function(err, data) {
                console.log("\nIn describe instances:\n");
                if (err) {
                    console.log(err, err.stack); // an error occurred
                    reject(error);
                }
                else {
                    console.log("\n\n" + data + "\n\n"); // successful response
                    resolve(data);
                }
            });

            console.log('Function Finished!');
        });
    }

    return {
        setup : setup,
        getFile : getFile,
        getFiles : getFiles,
        uploadFile : uploadFile,
        getEC2InstanceData : getEC2InstanceData
    };

};