/**
 * Created by asher on 07/04/15.
 */
module.exports = function () {
    var Promise = require('bluebird');
    const HOST = 'localhost';
    const PORT = 6379;
    var client;

    function setup() {
        var redis = require("redis");
        client = redis.createClient(PORT, HOST, {});
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

    function getKeysByPattern(keyPattern){
        return client.keysAsync(keyPattern);
    }

    function getValuesByKeys(getValuesByKeys){
        return client.mgetAsync(getValuesByKeys);
    }

    return {
        setup : setup,
        getObject : getObject,
        setObject : setObject,
        clearCache : clearCache,
        getKeysByPattern : getKeysByPattern,
        getValuesByKeys : getValuesByKeys
    };

};