/**
 * Created by asher on 18/04/15.
 */
var Promise = require('bluebird');

var s3 = require('../S3')();
s3.setup();

exports.calcGrades = function (req, res) {
    s3.getFiles()
        .then(function(gradeFilesMetadata) {
            return new Promise(function(resolve, reject) {
                // Find the file names and fetch.
                var filesPromise = [];
                var contents = gradeFilesMetadata.Contents;
                contents.forEach(function(fileMD) {
                    var fileKey = fileMD['Key'];
                    filesPromise.push(s3.getFile(fileKey));
                });

                var fileGrades = [];
                Promise.all(filesPromise).then(function(files) {
                    // We have all the files.
                    files.forEach(function(file) {
                        var gradeAvg = getAvg(file);
                        var fileGradeDesc = 'For File IDC-2014.txt the average grade is ' + gradeAvg;
                        fileGrades.push(fileGradeDesc);
                    });

                    resolve(fileGrades);
                }).catch(function(error) {
                    reject(error);
                });
            });
        })
        .then(function(data) {
            console.log('Data: ' + data);
            res.send(data);
        });
};


/**
 * The method calculates the average grade of the people listed in the JSON file.
 * @param gradesFile a text file containing a JSON object in the 'Grades' structure.
 * @returns {number} the average grade of all the people in the file.
 */
function getAvg(gradesFile) {
    console.log(gradesFile);
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