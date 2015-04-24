/**
 * Created by asher on 18/04/15.
 */
var Promise = require('bluebird');

var s3 = require('../AWSService')();
s3.setup();

var cache = require('../cacheLayer')();
cache.setup();

const GRADE_CACHE_PREFIX = 'grade:';

exports.calcGrades = function(req, res) {
    s3.getFiles().then(function(gradeFilesMetadata) {
        // Find the file names and fetch.
        var etagToFileName = {};
        var filesPromise = [];
        var contents = gradeFilesMetadata.Contents;
        contents.forEach(function (fileMD) {
            var fileKey = fileMD['Key'];
            filesPromise.push(s3.getFile(fileKey));
            etagToFileName[fileMD.ETag] = fileKey;
        });

        var fileGrades = [];
        Promise.all(filesPromise).then(function(files) {
            // We have all the files. Calculate the grades and generate response.
            files.forEach(function(file) {
                var gradeAvg = getAvg(file.Body.toString());
                var fileName = etagToFileName[file.ETag];
                var fileGrade = '{"fileName":' + '"' + fileName + '"' + ', "avgGrade":' + gradeAvg + '}';
                fileGrades.push(fileGrade);
                var cacheKey = GRADE_CACHE_PREFIX + fileName;
                cache.setObject(cacheKey, fileGrade);
            });

            res.send(fileGrades);
        });
    });
};


/**
 * The method calculates the average grade of the people listed in the JSON file.
 * @param gradesFile a text file containing a JSON object in the 'Grades' structure.
 * @returns {number} the average grade of all the people in the file.
 */
function getAvg(gradesFile) {
    var sum = 0;
    var numOfItems = 0;
    var personGrades = JSON.parse(gradesFile)['Grades'];
    personGrades.forEach(function(personGrade) {
        Object.keys(personGrade).forEach(function (name) {
            sum += personGrade[name];
            numOfItems++;
        });
    });

    return sum / numOfItems;
}

exports.showCacheGrades = function (req, res) {
    cache.getKeysByPattern(GRADE_CACHE_PREFIX + "*")
        .then(function(keys) {
            if (keys.length > 0) {
                cache.getValuesByKeys(keys).then(function(values) {
                    res.send(values);
                })
            } else {
                // No keys match the pattern, so not values in cache.
                var noValue = [];
                res.send(noValue);
            }
        });
};

exports.clearCache = function (req, res) {
    cache.clearCache()
        .then(function(data) {
            res.send(data);
        });
};