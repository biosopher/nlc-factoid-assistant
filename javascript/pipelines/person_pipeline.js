var Q = require('q');

//************ Constructor **************//
function PersonPipeline() {
    this.RdfQuery = require('../pipelines/rdf_query');
}

PersonPipeline.prototype.getAnswerForIntent = function(intent, dataLinks) {

    var deferred = Q.defer();

    var resourceType = null;
    var functionName = null;
    switch (intent) {
        case "person-spouse":
            resourceType = "dbp%3Aspouse"; // dbp:spouse
            break;
        case "person-children":
            //functionName = this.getChildrenAnswer;
            resourceType = "children";
            break;
        case "place-person-height":
            resourceType = "height";
            break;
        default:
            break;
    }

    if (functionName) {
        //answerText = functionName(intent,dataLinks);
        answerText = resourceType + " is Barack Obama's spouse.";
        deferred.resolve(answerText);
    } else if (resourceType){
        new this.RdfQuery().performQuery(dataLinks[0].dbpediaLink,resourceType)
        .then(function(response) {
                deferred.resolve(response);
            }, function(err) {
                deferred.reject(err);
            });
    }else{
        deferred.resolve(null);
    }
    return deferred.promise;
}

PersonPipeline.prototype.getChildrenAnswer = function(dataLinks) {
    //var dbpediaPageContent = loadDBpediaPage(dataLinks[0].dbpediaLink);
    return dataLinks[0].text + " has # children: ";
}

// Exported class
module.exports = PersonPipeline;
