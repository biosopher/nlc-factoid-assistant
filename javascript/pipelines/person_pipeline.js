var Q = require('q');
var RdfQuery = require('../pipelines/rdf_query');

// Constants
var RDF_REPLACE_STR = "$xxx_123_yyy$";

//************ Constructor **************//
function PersonPipeline() {

}

PersonPipeline.prototype.getAnswerForIntent = function(intent, dataLinks) {

    var deferred = Q.defer();

    var resourceType = null;
    var functionName = null;
    var replyText = null;
    switch (intent) {
        case "person-spouse":
            resourceType = "dbp%3Aspouse"; // dbp:spouse
            replyText = RDF_REPLACE_STR + " is the spouse of " + ;
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
        var answerText = resourceType + " is Barack Obama's spouse.";
        deferred.resolve(answerText);
    } else if (resourceType){
        new RdfQuery().performQuery(dataLinks[0].dbpediaLink,resourceType)
        .then(function(response) {
                if (response && response.indexOf("dbpedia.org")) {
                    var index = response.lastIndexOf("/")+1;
                    response = response.substr(index);
                    response = response.replace("_"," ");
                }
                var answerText = replyText.replace(RDF_REPLACE_STR,response);
                deferred.resolve(answerText);
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
