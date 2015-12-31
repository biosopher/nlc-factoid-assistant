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

HealthPipeline.prototype.isDiseaseType = function(entity) {

    var deferred = Q.defer();
    new DBpediaUtils.DBpediaQuery().performQuery(entity,"rdf%3Atype")
        .then(function(types) {
            var isDiseaseType = false;
            for (var i = 0; i < types.length; i++) {
                if (types[i].indexOf("Disease") >=0) {
                    isDiseaseType = true;
                    break;
                }
            }
            deferred.resolve(isDiseaseType);
        }, function(err) {
            deferred.reject(err);
        });
    return deferred.promise;
}

HealthPipeline.prototype.answerConditionCause = function(deferred,dataLinks) {

    // First determine if entity is of type=disease
    var dbpediaLink = dataLinks.pages[0].dbpediaLink;
    var entity = DBpediaUtils.extractDBpediaEntity(dbpediaLink);
    this.isDiseaseType(entity)
        .then(function(isDiseaseType) {

            if (isDiseaseType) {
                new DBpediaUtils.DBpediaQuery().performQuery(entity,"rdfs%3Acomment",true)
                    .then(function(comments) {
                        if (comments && comments.length) {
                            deferred.resolve(comments[0]);
                        }else{
                            deferred.resolve(null);
                        }
                    }, function(err) {
                        deferred.reject(err);
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
