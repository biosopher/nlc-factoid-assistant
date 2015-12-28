var bluemix  = require('../config/bluemix');
var extend      = require('util')._extend;
var Q = require('q');
var wdc = require('watson-developer-cloud');


function AlchemyApiUtils(watson,callback) {

    // If bluemix credentials (VCAP_SERVICES) are present then override the local credentials
    watson.config.alchemyapi = extend(watson.config.alchemyapi, bluemix.getServiceCreds('alchemyapi')); // VCAP_SERVICES

    if (watson.config.alchemyapi) {
        this.alchemyService = wdc.alchemy_language({
            api_key: watson.config.alchemyapi.api_key,
            version: 'v1'
        });
    }else{
        callback({errMessage : "AlchemyApi key not found"});
    }
}
AlchemyApiUtils.prototype.extractLinkedData = function(userText) {

    var deferred = Q.defer();

    var internalThis = this;
    this.extractEntities(userText)
        .then(function(entitiesResponse) {

            internalThis.extractConcepts(userText)
                .then(function(conceptsResponse) {

                    var dataLinks = internalThis.combineDataLinks(entitiesResponse, conceptsResponse);
                    deferred.resolve(dataLinks);
                }, function(err) {
                    console.log("Failed to extract concepts for '" + userText + ". " + JSON.stringify(err));
                    deferred.resolve(err);
                });
        }, function(err) {
            console.log("Failed to extract entities for '" + userText + ". " + JSON.stringify(err));
            deferred.resolve(err);
        });
    return deferred.promise;
}

AlchemyApiUtils.prototype.extractEntities = function(userText) {

    var deferred = Q.defer();
    var params = {
        text: userText
    };

    this.alchemyService.entities(params, function (err, response) {
        if (err)
            deferred.reject(err);
        else
            deferred.resolve(response);
    });
    return deferred.promise;
}

AlchemyApiUtils.prototype.extractConcepts = function(userText) {

    var deferred = Q.defer();
    var params = {
        text: userText
    };

    this.alchemyService.concepts(params, function (err, response) {
        if (err)
            deferred.reject(err);
        else
            deferred.resolve(response);
    });
    return deferred.promise;
}

AlchemyApiUtils.prototype.combineDataLinks = function(entitiesResponse,conceptsResponse) {

    var dataLinks = [];
    var foundDataMap = {}; // Avoid returning duplicate data types
    var summary = "";
    var dbpediaLinkSummary = "";
    var freebaseLinkSummary = "";
    var yagoLinkSummary = "";
    var opencycLinkSummary = "";
    if (entitiesResponse && entitiesResponse.entities) {
        for (var i = 0; i < entitiesResponse.entities.length; i++) {
            var entity = entitiesResponse.entities[i];
            if (entity.disambiguated && entity.disambiguated.dbpedia) {
                var page = {};
                foundDataMap[entity.text] = page;
                page.text = entity.text;
                page.type = entity.type;
                page.dbpediaLink = entity.disambiguated.dbpedia;
                page.freebaseLink = entity.disambiguated.freebase;
                page.yagoLink = entity.disambiguated.yago;
                page.opencycLink = entity.disambiguated.opencyc;

                dataLinks[dataLinks.length] = page;
                summary += page.text+" (e):<br>";
                dbpediaLinkSummary += "<a href='"+page.dbpediaLink+"'>DBpedia</a><br>";
                if (page.freebaseLink) {
                    freebaseLinkSummary += "<a href='"+page.freebaseLink+"'>Freebase</a><br>";
                }
                if (page.yagoLink) {
                    yagoLinkSummary += "<a href='"+page.yagoLink+"'>Yago</a><br>";
                }
                if (page.opencycLink) {
                    opencycLinkSummary += "<a href='"+page.opencycLink+"'>OpenCyc</a><br>";
                }
            }
        }
    }
    if (conceptsResponse && conceptsResponse.concepts && conceptsResponse.concepts.length > 0) {
        for (var i = 0; i < conceptsResponse.concepts.length; i++) {
            var concept = conceptsResponse.concepts[i];
            if (concept.dbpedia && !foundDataMap[concept.text]) {
                var page = {};
                foundDataMap[concept.text] = page;
                page.text = concept.text;
                page.type = concept.type;
                page.dbpediaLink = concept.dbpedia;
                page.freebaseLink = concept.freebase;
                page.yagoLink = concept.yago;
                page.opencycLink = concept.opencyc;

                dataLinks[dataLinks.length] = page;
                summary += page.text + " (c):<br>";
                dbpediaLinkSummary += "<a href='" + page.dbpediaLink + "'>DBpedia</a><br>";
                if (page.freebaseLink) {
                    freebaseLinkSummary += "<a href='" + page.freebaseLink + "'>Freebase</a><br>";
                }
                if (page.yagoLink) {
                    yagoLinkSummary += "<a href='" + page.yagoLink + "'>Yago</a><br>";
                }
                if (page.opencycLink) {
                    opencycLinkSummary += "<a href='" + page.opencycLink + "'>OpenCyc</a><br>";
                }
            }
        }
    }

    if (summary.length == 0) {
        summary = "No entities found";
    }
    dataLinks.summary = summary;
    dataLinks.dbpediaLinkSummary = dbpediaLinkSummary;
    dataLinks.freebaseLinkSummary = freebaseLinkSummary;
    dataLinks.yagoLinkSummary = yagoLinkSummary;
    dataLinks.opencycLinkSummary = opencycLinkSummary;
    return dataLinks;
}

// Exported class
module.exports = AlchemyApiUtils;
