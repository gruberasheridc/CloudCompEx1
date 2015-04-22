/**
 * Created by asher on 07/04/15.
 */
module.exports = function () {
    var Promise = require('bluebird');
    var client;

    function setup() {
        var redis = require("redis");
        client = redis.createClient(6379, 'localhost', {});
        Promise.promisifyAll(client);
    }


    function getObject(key){
        return client.getAsync(key);
    }

    function setObject(key, value){
        return client.setAsync(key, value);
    }

    function clearCache(){
        return client.flushallAsync();
    }

    function getValuesByKeyPattern(keyPattern){
        return client.keysAsync(keyPattern);
    }

    return {
        setup : setup,
        getObject : getObject,
        setObject : setObject,
        clearCache : clearCache,
        getValuesByKeyPattern : getValuesByKeyPattern
    };

};