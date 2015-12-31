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

    var foundDataMap = {}; // Avoid returning duplicate data types
    var entitySummary = "";
    var dbpediaLinkSummary = "";
    var freebaseLinkSummary = "";
    var yagoLinkSummary = "";
    var opencycLinkSummary = "";
    var dataLinks = {};
    dataLinks.pages = [];
    if (entitiesResponse && entitiesResponse.entities) {
        for (var i = 0; i < entitiesResponse.entities.length; i++) {
            var entity = entitiesResponse.entities[i];
            if (entity.disambiguated && entity.disambiguated.dbpedia) {
                var page = {};
                dataLinks.pages[dataLinks.pages.length] = page;
                foundDataMap[entity.text] = page;

                page.text = entity.text;
                page.type = entity.type;
                page.relevance = entity.relevance;
                page.dbpediaLink = entity.disambiguated.dbpedia;
                page.freebaseLink = entity.disambiguated.freebase;
                page.yagoLink = entity.disambiguated.yago;
                page.opencycLink = entity.disambiguated.opencyc;

                entitySummary += page.text+" (e):<br>";
                dbpediaLinkSummary += "<a href='"+page.dbpediaLink+"' target='_blank'>DBpedia</a><br>";
                if (page.freebaseLink) {
                    freebaseLinkSummary += "<a href='"+page.freebaseLink+"' target='_blank'>Freebase</a><br>";
                }
                if (page.yagoLink) {
                    yagoLinkSummary += "<a href='"+page.yagoLink+"' target='_blank'>Yago</a><br>";
                }
                if (page.opencycLink) {
                    opencycLinkSummary += "<a href='"+page.opencycLink+"' target='_blank'>OpenCyc</a><br>";
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
                dataLinks.pages[dataLinks.pages.length] = page;
                page.text = concept.text;
                page.type = concept.type;
                page.relevance = concept.relevance;
                page.dbpediaLink = concept.dbpedia;
                page.freebaseLink = concept.freebase;
                page.yagoLink = concept.yago;
                page.opencycLink = concept.opencyc;

                entitySummary += page.text + " (c):<br>";
                dbpediaLinkSummary += "<a href='" + page.dbpediaLink + "' target='_blank'>DBpedia</a><br>";
                if (page.freebaseLink) {
                    freebaseLinkSummary += "<a href='" + page.freebaseLink + "' target='_blank'>Freebase</a><br>";
                }
                if (page.yagoLink) {
                    yagoLinkSummary += "<a href='" + page.yagoLink + " target='_blank''>Yago</a><br>";
                }
                if (page.opencycLink) {
                    opencycLinkSummary += "<a href='" + page.opencycLink + "' target='_blank'>OpenCyc</a><br>";
                }
            }
        }
    }

    if (entitySummary.length == 0) {
        entitySummary = "No entities found";
    }
    dataLinks.entity_summary = entitySummary;
    dataLinks.dbpedia_link_summary = dbpediaLinkSummary;
    dataLinks.freebase_link_summary = freebaseLinkSummary;
    dataLinks.yago_link_summary = yagoLinkSummary;
    dataLinks.opencyc_link_summary = opencycLinkSummary;
    return dataLinks;
}

// Exported class
module.exports = AlchemyApiUtils;
