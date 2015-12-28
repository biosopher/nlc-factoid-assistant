var Q = require('q');
var PlacePipeline = require('../pipelines/place_pipeline');
var PersonPipeline = require('../pipelines/person_pipeline');
var placePipeline = new PlacePipeline();
var personPipeline = new PersonPipeline();

//************ Constructor **************//
function Pipelines() {

}

Pipelines.prototype.determineAnswerText = function(intent, dataLinks) {

    var deferred = Q.defer();

    placePipeline.getAnswerForIntent(intent, dataLinks)
        .then(function(answer) {
            if (answer) {
                deferred.resolve(answer);
            }else {
                personPipeline.getAnswerForIntent(intent, dataLinks)
                    .then(function (answer) {
                        deferred.resolve(answer);
                    }, function (err) {
                        deferred.reject(err);
                    });
            }
        }, function(err) {
            deferred.reject(err);
        });
    return deferred.promise;
}

// Exported class
module.exports = Pipelines;
