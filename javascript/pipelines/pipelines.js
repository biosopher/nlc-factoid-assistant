var Q = require('q');
var HealthPipeline = require('../pipelines/health_pipeline');
var PersonPipeline = require('../pipelines/person_pipeline');
var PlacePipeline = require('../pipelines/place_pipeline');

var healthPipeline = new HealthPipeline();
var personPipeline = new PersonPipeline();
var placePipeline = new PlacePipeline();

//************ Constructor **************//
function Pipelines() {

}

Pipelines.prototype.determineAnswerText = function(intent, dataLinks) {

    var deferred = Q.defer();
    var index = intent.indexOf("-");
    var pipeline;
    switch (intent.substring(0,index)) {
        case "health":
            pipeline = healthPipeline;
            break;
        case "person":
            pipeline = personPipeline;
            break;
        case "place":
            pipeline = placePipeline;
            break;
        default:
            pipeline = null;
            break;
    }

    if (pipeline == null) {
        deferred.resolve("Error. Unrecognized factoid received from the NLC.");
    }else{
        pipeline.getAnswerForIntent(intent, dataLinks)
            .then(function (answer) {
                if (answer) {
                    deferred.resolve(answer);
                }else {
                    deferred.resolve(null);
                }
            }, function (err) {
                deferred.reject(err);
            });
    }
    return deferred.promise;
}

// Exported class
module.exports = Pipelines;
