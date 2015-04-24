/**
 * Created by asher on 18/04/15.
 */
var Promise = require('bluebird');

var s3 = require('../S3')();
s3.setup();

exports.awsStatus = function (req, res) {
    // Get AWS status information.
    var awsStatus = [];
    awsStatus.push(s3.getEC2InstanceData());
    awsStatus.push(s3.getELBInstanceData());

    Promise.all(awsStatus).then(function(awsInstancesData) {
        // Process AWS Status information.
        var ec2InstanceData = awsInstancesData[0];
        var instances = parseEC2InstancesData(ec2InstanceData);
        var elbInstanceData = awsInstancesData[1];
        var elbs = parseELBInstancesData(elbInstanceData);

        // Create AWS Status response.
        awsStatus = {};
        awsStatus["ec2Instances"] = instances;
        awsStatus["elbs"] = elbs;

        res.send(awsStatus);
    }).catch(function(error) {
        res("Error while getting aws status. " + error);
    });
};

function parseEC2InstancesData(ec2InstanceData) {
    var instances = [];
    ec2InstanceData.Reservations.forEach(function (reservation) {
        reservation.Instances.forEach(function (instance) {
            var type = instance.InstanceType;
            var availabilityZone = instance.Placement.AvailabilityZone;
            var state = instance.State.Name;
            var nameTag = getTagByKey(instance.Tags, "Name");
            var name = nameTag ? nameTag.Value : "";
            var instance = {};
            instance["type"] = type;
            instance["availabilityZone"] = availabilityZone;
            instance["state"] = state;
            instance["name"] = name;
            instances.push(instance);
        });
    });

    return instances;
}

function parseELBInstancesData(elbInstanceData) {
    var elbs = [];
    elbInstanceData.LoadBalancerDescriptions.forEach(function (lbDesc) {
        var name = lbDesc.LoadBalancerName;
        var dnsName = lbDesc.DNSName;
        var availabilityZones = lbDesc.AvailabilityZones;
        var createdTime = lbDesc.CreatedTime;
        var scheme = lbDesc.Scheme;
        var instances = [];
        if (lbDesc.Instances) {
            lbDesc.Instances.forEach(function (instance) {
                instances.push(instance.InstanceId);
            });
        }
        var loadBalancer = {};
        loadBalancer["name"] = name;
        loadBalancer["dnsName"] = dnsName;
        loadBalancer["availabilityZones"] = availabilityZones;
        loadBalancer["createdTime"] = createdTime;
        loadBalancer["scheme"] = scheme;
        loadBalancer["instances"] = instances;
        elbs.push(loadBalancer);
    });

    return elbs;
}

function  getTagByKey(tags, key) {
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