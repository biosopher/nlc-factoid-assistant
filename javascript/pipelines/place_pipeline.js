var Q = require('q');

//************ Constructor **************//
function PlacePipeline() {
    this.RdfQuery = require('../pipelines/rdf_query');
}

PlacePipeline.prototype.getAnswerForIntent = function(intent, dataLinks) {

    var deferred = Q.defer();

    var requiredEntityTrait = null;
    var functionName = null;
    switch (intent) {
        case "place-capital":
            requiredEntityTrait = "capital";
            break;
        case "place-population":
            requiredEntityTrait = "population";
            break;
        case "place-person-height":
            requiredEntityTrait = "height";
            break;
        default:
            break;
    }

    if (functionName) {
        //answerText = functionName(intent,dataLinks);
        var answerText = requiredEntityTrait + " is Barack Obama's spouse.";
        deferred.resolve(answerText);
    } else if (requiredEntityTrait){
        new this.RdfQuery().performQuery(dataLinks[0].dbpediaLink,requiredEntityTrait)
            .then(function(response) {
                answerText = response;
            }, function(err) {
                deferred.reject(err);
            });
    }else{
        deferred.resolve(null);
    }
    return deferred.promise;
}

// Exported class
module.exports = PlacePipeline;
