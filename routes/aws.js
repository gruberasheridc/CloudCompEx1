/**
 * Created by asher on 18/04/15.
 */

var s3 = require('../S3')();
s3.setup();

var cache = require('../cacheLayer')();
cache.setup();

exports.awsStatus = function (req, res) {
    s3.getEC2InstanceData()
        .then(function(data) {
            var instances = [];
            data.Reservations.forEach(function(reservation) {
                reservation.Instances.forEach(function(instance) {
                    var type = instance.InstanceType;
                    var availabilityZone = instance.Placement.AvailabilityZone;
                    var state = instance.State.Name;
                    var nameTag = getTagByKey(instance.Tags, "Name");
                    var name =  nameTag ? nameTag.Value : "";

                    var instance = {};
                    instance["type"] = type;
                    instance["availabilityZone"] = availabilityZone;
                    instance["state"] = state;
                    instance["name"] = name;

                    instances.push(instance);
                });
            });

            res.send(instances);
        });
};

function getTagByKey(tags, key) {
    var retval = null;
    if (tags) {
        for (var i = 0; i < tags.length; i++) {
            var tag = tags[i];
            if (tag.Key == key) {
                retval = tag;
                break;
            }
        }
    }

    return retval;
};

exports.clearCache = function (req, res) {
    cache.clearCache()
        .then(function(data) {
            console.log('Data: ' + data);
            res.send(data);
        });
};