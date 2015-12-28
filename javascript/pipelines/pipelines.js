var Q = require('q');

//************ Constructor **************//
function Pipelines() {

    var PlacePipeline = require('../pipelines/place_pipeline');
    var PersonPipeline = require('../pipelines/person_pipeline');
    this.placePipeline = new PlacePipeline();
    this.personPipeline = new PersonPipeline();
}

Pipelines.prototype.determineAnswerText = function(intent, dataLinks) {

    var deferred = Q.defer();

    var internalThis = this;
    this.placePipeline.getAnswerForIntent(intent, dataLinks)
        .then(function(answer) {
            if (answer) {
                deferred.resolve(answer);
            }else {
                internalThis.personPipeline.getAnswerForIntent(intent, dataLinks)
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
