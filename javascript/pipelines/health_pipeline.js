var Q = require('q');
var DBpediaUtils = require('../pipelines/dbpedia_utils');

//************ Constructor **************//
function HealthPipeline() {

}

HealthPipeline.prototype.getAnswerForIntent = function(intent, dataLinks) {

    var deferred = Q.defer();
    switch (intent) {
        case "health-condition_cause":
            this.answerConditionCause(deferred,dataLinks);
            break;
        default:
            deferred.resolve(null);
            break;
    }
    return deferred.promise;
}

HealthPipeline.prototype.isDiseaseType = function(dataLinks) {

    var deferred = Q.defer();
    DBpediaUtils.performQueryAndResolve(dataLinks, ["rdf%3Atype"],false,false,deferred,function (entity, answers, index) {
        var isDiseaseType = false;
        for (var i = 0; i < answers.length; i++) {
            if (answers[i].indexOf("Disease") >=0) {
                isDiseaseType = true;
                break;
            }
        }
        return isDiseaseType;
    });
    return deferred.promise;
}

HealthPipeline.prototype.answerConditionCause = function(deferred,dataLinks) {

    // First determine if entity is of type=disease
    this.isDiseaseType(dataLinks)
        .then(function(isDiseaseType) {
            if (isDiseaseType) {
                DBpediaUtils.performQueryAndResolve(dataLinks, ["rdfs%3Acomment"],true,false,deferred,function (entity, answers, index) {
                    return answers[0];
                });
            }else{
                deferred.resolve(null);
            }
        }, function(err) {
            deferred.reject(err);
        });
}

// Exported class
module.exports = HealthPipeline;
