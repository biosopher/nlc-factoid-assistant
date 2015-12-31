var Q = require('q');

//************ Constructor **************//
function DBpediaQuery() {
    this.HttpUtils = require('../pipelines/http_utils');
}

DBpediaQuery.prototype.performQuery = function(entity, type,isFilterEnglishOnly) {

    var deferred = Q.defer();
    var jsonResponse = {};

    entity = entity.replace(" ","_");
    var filter = '';
    if (isFilterEnglishOnly) {
        filter = '%20FILTER %28langMatches%28lang%28%3Fresource%29%2C"en"%29%29'
    }
    var url = "http://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=select%20%3Fresource%20where%20%7B%20%3Chttp%3A%2F%2Fdbpedia.org%2Fresource%2F"+entity+"%3E%20"+type+"%20%3Fresource"+filter+"%7D&format=json";
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
                        console.log("Failure extracting "+type+" for "+entity+" from dbpedia results.\nURL: " + JSON.stringify(url));
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

function convertDBpediaLinkArrayToLinksString(dbpediaLinks) {
    var entityLinks = "";
    for (var i = 0; i < dbpediaLinks.length; i++) {
        if (i > 0) {
            if (i == dbpediaLinks.length-1) {
                entityLinks += " and "; // last answer
            }else {
                entityLinks += ", ";
            }
        }
        var entity = extractDBpediaEntity(dbpediaLinks[i])
        entityLinks += "<a href='"+dbpediaLinks[i]+"' target='_blank'>"+ entity.replace("_"," ") + "</a>"
    }
    return entityLinks;
}

function convertArrayToString(array) {
    var text = "";
    for (var i = 0; i < array.length; i++) {
        if (i > 0) {
            if (i == array.length-1) {
                text += " and "; // last item
            }else {
                text += ", ";
            }
        }
        text += answers[i]
    }
    return text;
}

// Exported class
module.exports.DBpediaQuery = DBpediaQuery;
module.exports.convertArrayToString = convertArrayToString;
module.exports.convertDBpediaLinkArrayToLinksString = convertDBpediaLinkArrayToLinksString;
module.exports.extractDBpediaEntity = extractDBpediaEntity;
