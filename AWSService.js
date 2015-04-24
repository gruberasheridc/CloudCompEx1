/**
 * Created by asher on 07/04/15.
 */
module.exports = function () {
    var Promise = require('bluebird');
    var AWS = require('aws-sdk');
    const bucketName = 'cloudcomp.agruber';

    function setup() {
        // The AWS Credentials are loaded from the credential local file which is defined as best practice.
        AWS.config.region = 'eu-west-1';
    }

    function getFile(key) {
        return new Promise(function(resolve, reject){
            var params = {Bucket: bucketName, Key: key, ResponseContentType : 'application/json'};
            var s3 = new AWS.S3();
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
            var s3 = new AWS.S3();
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

            var s3 = new AWS.S3();
            s3.putObject(params, function(error, data) {
                if (error) { reject(error); }
                else { resolve(data); }
            });
        });
    }

    function getEC2InstanceData() {
        return new Promise(function(resolve, reject){
            var ec2 = new AWS.EC2();
            ec2.describeInstances(function(err, data) {
                if (err) {
                    reject(error);
                }
                else {
                    resolve(data);
                }
            });
        });
    }

    function getELBInstanceData() {
        return new Promise(function(resolve, reject){
            var elb = new AWS.ELB();
            elb.describeLoadBalancers(function(err, data) {
                if (err) {
                    reject(error);
                }
                else {
                    resolve(data);
                }
            });
        });
    }

    return {
        setup : setup,
        getFile : getFile,
        getFiles : getFiles,
        uploadFile : uploadFile,
        getEC2InstanceData : getEC2InstanceData,
        getELBInstanceData : getELBInstanceData
    };

};