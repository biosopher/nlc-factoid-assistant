var bluemix  = require('../config/bluemix');
var extend      = require('util')._extend;
var Q = require('q');
var fs = require('fs');
var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');

function NluUtils(watson,callback) {

    // If bluemix credentials (VCAP_SERVICES) are present then override the local credentials
    watson.config.nlu = extend(watson.config.nlu, bluemix.getServiceCreds('natural_language_understanding')); // VCAP_SERVICES

    if (watson.config.nlu) {
        this.nluService = new NaturalLanguageUnderstandingV1({
            username: watson.config.nlu.username,
            password: watson.config.nlu.password,
            version: '2017-02-27',
            url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
        });
    }else{
        callback({errMessage : "NLU username and password not found"});
    }
}

NluUtils.prototype.extractLinkedData = function(userText) {

    var deferred = Q.defer();

    var internalThis = this;
    this.analyze(userText)
        .then(function(response) {
            var dataLinks = internalThis.getDataLinks(response);
            deferred.resolve(dataLinks);
        }, function(err) {
            console.log("Failed to extract entities for '" + userText + ". " + JSON.stringify(err));
            deferred.resolve(err);
        });
    return deferred.promise;
};

NluUtils.prototype.analyze = function(userText) {

    var deferred = Q.defer();
    var params = {
        text: userText
    };

    var parameters = {
      'text': userText,
      'features': {
          'entities': {
              'limit': 3
          },
          'concepts': {
              'limit': 3
          }
      }
    };

    this.nluService.analyze(parameters, function(err, response) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(response);
        }
    });
    return deferred.promise;
};

NluUtils.prototype.extractEntities = function(userText) {

    var deferred = Q.defer();
    var params = {
        text: userText
    };

    this.nluService.entities(params, function (err, response) {
        if (err)
            deferred.reject(err);
        else
            deferred.resolve(response);
    });
    return deferred.promise;
};

NluUtils.prototype.extractConcepts = function(userText) {

    var deferred = Q.defer();
    var params = {
        text: userText
    };

    this.nluService.concepts(params, function (err, response) {
        if (err)
            deferred.reject(err);
        else
            deferred.resolve(response);
    });
    return deferred.promise;
};

NluUtils.prototype.getDataLinks = function(response) {

    var foundDataMap = {}; // Avoid returning duplicate data types
    var entitySummary = "";
    var dbpediaLinkSummary = "";
    var dataLinks = {};
    dataLinks.pages = [];
    if (response && response.entities) {
        for (var i = 0; i < response.entities.length; i++) {
            var entity = response.entities[i];
            if (entity.disambiguation && entity.disambiguation.dbpedia_resource) {
                var page = {};
                dataLinks.pages[dataLinks.pages.length] = page;
                foundDataMap[entity.text] = page;

                page.text = entity.text;
                page.type = entity.type;
                page.relevance = entity.relevance;
                page.dbpedia_resource = entity.disambiguation.dbpedia_resource;

                entitySummary += page.text+" (e):<br>";
                dbpediaLinkSummary += "<a href='"+page.dbpedia_resource+"' target='_blank'>DBpedia</a><br>";
            }
        }
    }
    if (response && response.concepts && response.concepts.length > 0) {
        for (var i = 0; i < response.concepts.length; i++) {
            var concept = response.concepts[i];
            if (concept.dbpedia_resource && !foundDataMap[concept.text]) {
                var page = {};
                foundDataMap[concept.text] = page;
                dataLinks.pages[dataLinks.pages.length] = page;
                page.text = concept.text;
                page.relevance = concept.relevance;
                page.dbpedia_resource = concept.dbpedia_resource;

                entitySummary += page.text + " (c):<br>";
                dbpediaLinkSummary += "<a href='" + page.dbpedia_resource + "' target='_blank'>DBpedia</a><br>";
            }
        }
    }

    if (entitySummary.length == 0) {
        entitySummary = "No entities found";
    }
    dataLinks.entity_summary = entitySummary;
    dataLinks.dbpedia_link_summary = dbpediaLinkSummary;
    return dataLinks;
};

// Exported class
module.exports = NluUtils;
