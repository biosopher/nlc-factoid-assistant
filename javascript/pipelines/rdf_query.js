var Q = require('q');

//************ Constructor **************//
function RdfQuery() {
    this.HttpUtils = require('../pipelines/http_utils');
}

RdfQuery.prototype.performQuery = function(resource, type) {

    var deferred = Q.defer();
    var jsonResponse = {};

    var url = "http://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=select%20%3Fresource%20where%20%7B%20%3Chttp%3A%2F%2Fdbpedia.org%2Fresource%2FBarack_Obama%3E%20"+type+"%20%3Fresource%7D&format=json";
    new this.HttpUtils().sendToServer("GET",url,null,null,null,null)
        .then(function (data) {
            console.log("dbpedia: " + JSON.stringify(data));
            if (data != '') {
                try {
                    if (data.results && data.results.bindings && data.results.bindings.length > 0 && data.results.bindings[0].resource) {
                        jsonResponse = data.results.bindings[0].resource.value;
                        deferred.resolve(jsonResponse);
                    }else{
                        console.log("Failed to extract dbpedia value.");
                        deferred.reject(err);
                    }
                }catch(err) {
                    deferred.reject(err);
                }
            }
        }, function (err) {
            deferred.reject(err);
        });
    return deferred.promise;
}

// Exported class
module.exports = RdfQuery;
