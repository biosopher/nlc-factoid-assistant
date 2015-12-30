var Q = require('q');

//************ Constructor **************//
function DBpediaQuery() {
    this.HttpUtils = require('../pipelines/http_utils');
}

DBpediaQuery.prototype.performQuery = function(entity, type) {

    var deferred = Q.defer();
    var jsonResponse = {};

    entity = entity.replace(" ","_");
    var url = "http://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=select%20%3Fresource%20where%20%7B%20%3Chttp%3A%2F%2Fdbpedia.org%2Fresource%2F"+entity+"%3E%20"+type+"%20%3Fresource%7D&format=json";
    new this.HttpUtils().sendToServer("GET",url,null,null,null,null)
        .then(function (data) {
            console.log("dbpedia: " + JSON.stringify(data));
            if (data != '') {
                try {
                    if (data.results && data.results.bindings && data.results.bindings.length > 0) {
                        var answers = [];
                        for (var i = 0; i < data.results.bindings.length; i++) {
                            answers[i] = data.results.bindings[i].resource.value
                        }
                        deferred.resolve(answers);
                    }else{
                        console.log("Failure extracting expected value from dbpedia results.\nURL: " + JSON.stringify(url));
                        deferred.resolve(null); // Fail gracefully and assume a malformed result due to invalid query format
                    }
                }catch(err) {
                    // Assume a malformed query due to invalid query format
                    console.log("DBpedia request parsing error.\nURL: " + JSON.stringify(url)+"\nURL: "+ JSON.stringify(err));
                    deferred.resolve(null);
                }
            }
        }, function (err) {
            // Assume a malformed query due to invalid query format
            console.log("DBpedia request error.\nURL: " + JSON.stringify(url)+"\nURL: "+ JSON.stringify(err));
            deferred.resolve(null);
        });
    return deferred.promise;
}

function extractDBpediaEntity(dbpediaink) {
    var entity = null;
    if (dbpediaink && dbpediaink.indexOf("dbpedia.org")) {
        var index = dbpediaink.lastIndexOf("/")+1;
        entity = dbpediaink.substr(index);
    }
    return entity;
}

function convertArrayToString(answers) {
    var answerStr = "";
    for (var i = 0; i < answers.length; i++) {
        if (i > 0) {
            if (i == answers.length-1) {
                answerStr += " and "; // last answer
            }else {
                answerStr += ", ";
            }
        }
        answerStr += answers[i]
    }
    return answerStr;
}

 /*function getDBpediaLinkWithType(dataLinks,dataType) {
    var dbpediaLink = dataLinks.pages[0].dbpediaLink;
    return dbpediaLink;
}*/



// Exported class
module.exports.DBpediaQuery = DBpediaQuery;
module.exports.extractDBpediaEntity = extractDBpediaEntity;
module.exports.convertArrayToString = convertArrayToString;
