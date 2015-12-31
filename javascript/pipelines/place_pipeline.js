var Q = require('q');
var DBpediaUtils = require('../pipelines/dbpedia_utils');
var DateUtils = require('../pipelines/date_utils');

//************ Constructor **************//
function PlacePipeline() {

}

PlacePipeline.prototype.getAnswerForIntent = function(intent, dataLinks) {

    var deferred = Q.defer();
    switch (intent) {
        case "place-areacode":
            this.answerAreaCode(deferred,dataLinks);
            break;
        case "place-capital":
            this.answerCapital(deferred,dataLinks);
            break;
        case "place-governor_mayor":
            this.answerGovernorMayor(deferred,dataLinks);
            break;
        case "place-completionDate":
            this.answerCompletionDate(deferred,dataLinks);
            break;
        case "place-population":
            this.answerPopulation(deferred,dataLinks);
            break;
        default:
            deferred.resolve(null);
            break;
    }
    return deferred.promise;
}

PlacePipeline.prototype.answerAreaCode = function(deferred,dataLinks) {

    DBpediaUtils.performQueryAndResolve(dataLinks,"dbp%3AareaCode", false, deferred, function(entity,answers) {
        return "The area code for " + DBpediaUtils.linkForEntity(entity) + " is " + answers[0];
    });
}

PlacePipeline.prototype.answerCapital = function(deferred,dataLinks) {

    DBpediaUtils.performQueryAndResolve(dataLinks,"dbp%3Acapital", false, deferred, function(entity,answers) {
        return DBpediaUtils.linkForEntity(answers[0]) + " is the capital of "+ DBpediaUtils.linkForEntity(entity);
    });
}

PlacePipeline.prototype.answerCompletionDate = function(deferred,dataLinks) {

    DBpediaUtils.performQueryAndResolve(dataLinks,"dbp%3AcompletionDate", false, deferred, function(entity,answers) {
        var date = answers[0];
        if (date.indexOf("-")>0) {
            // parse date string else assume this is just a year value
            date = DateUtils.getDateAsString();
        }
        return DBpediaUtils.linkForEntity(entity) + " was completed on " + date;
    });
}

PlacePipeline.prototype.answerGovernorMayor = function(deferred,dataLinks) {

    // First test for governor
    DBpediaUtils.performQueryForTypeArrayAndResolve(dataLinks,["dbp%3Agovernor","dbp%3AleaderName"], false, deferred, function(entity,answers,typeIndex) {
        if (typeIndex == 0) {
            return DBpediaUtils.linkForEntity(answers[0]) + " is the governor of "+ DBpediaUtils.linkForEntity(entity);
        }else{
            // Else try mayor
            return DBpediaUtils.linkForEntity(answers[0]) + " is the mayor of " + DBpediaUtils.linkForEntity(entity);
        }
    });
}

PlacePipeline.prototype.answerPopulation = function(deferred,dataLinks) {

    // First use the format most popular with cities and countries
    DBpediaUtils.performQueryForTypeArrayAndResolve(dataLinks,["dbo%3ApopulationTotal","dbp%3A2010pop"], false, deferred, function(entity,answers,typeIndex) {
        if (typeIndex == 0) {
            // regex at end is used to add commas to large numbers
            return DBpediaUtils.linkForEntity(entity) + "'s population is " + answers[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }else{
            // Else oddly states in America have a different format
            // regex at end is used to add commas to large numbers
            return DBpediaUtils.linkForEntity(entity) + "'s population as of the 2010 census was " + answers[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
    });
}

// Exported class
module.exports = PlacePipeline;
