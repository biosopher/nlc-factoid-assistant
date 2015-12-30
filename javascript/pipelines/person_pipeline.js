var Q = require('q');
var DBpediaUtils = require('../pipelines/dbpedia_utils');
var DateUtils = require('../pipelines/date_utils');

// Constants
var RDF_REPLACE_STR = "$xxx_123_yyy$";

//************ Constructor **************//
function PersonPipeline() {

}

PersonPipeline.prototype.getAnswerForIntent = function(intent, dataLinks) {

    var deferred = Q.defer();
    switch (intent) {
        case "place-birthdate":
            this.answerBirthday(deferred,dataLinks);
        case "place-birthplace":
            this.answerBirthPlace(deferred,dataLinks);
            break;
        case "person-children":
            this.answerChildren(deferred,dataLinks);
            break;
        case "person-net_worth":
            this.answerNetWorth(deferred,dataLinks);
        case "person-schooling":
            this.answerSchooling(deferred,dataLinks);
        case "person-spouse":
            this.answerSpouse(deferred,dataLinks);
            break;
        default:
            deferred.resolve(null);
            break;
    }
    return deferred.promise;
}

PersonPipeline.prototype.answerBirthday = function(deferred,dataLinks) {

    //var dbpediaLink = DBpediaUtils.getDBpediaLinkWithType(dataLinks,["person"]);
    var dbpediaLink = dataLinks.pages[0].dbpediaLink;
    var entity = DBpediaUtils.extractDBpediaEntity(dbpediaLink);
    new DBpediaUtils.DBpediaQuery().performQuery(entity,"dbp%3AbirthDate")
        .then(function(answers) {
            var date = DateUtils.getDateAsString(answers[0]);
            var yearsSinceNow = DateUtils.getYearsSinceNow(answers[0]);
            deferred.resolve(entity + " is " + yearsSinceNow + " years old and was born on " + date);
        }, function(err) {
            deferred.reject(err);
        });
}

PersonPipeline.prototype.answerBirthPlace = function(deferred,dataLinks) {

    //var dbpediaLink = DBpediaUtils.getDBpediaLinkWithType(dataLinks,["person"]);
    var dbpediaLink = dataLinks.pages[0].dbpediaLink;
    var entity = DBpediaUtils.extractDBpediaEntity(dbpediaLink);
    new DBpediaUtils.DBpediaQuery().performQuery(entity,"dbp%3AbirthDate")
        .then(function(answers) {
            deferred.resolve(entity + "'s height is " + answers[0]);
        }, function(err) {
            deferred.reject(err);
        });
}

PersonPipeline.prototype.answerChildren = function(deferred,dataLinks) {

    var dbpediaLink = dataLinks.pages[0].dbpediaLink;
    var entity = DBpediaUtils.extractDBpediaEntity(dbpediaLink);
    new DBpediaUtils.DBpediaQuery().performQuery(entity,"dbp%3Achildren")
        .then(function(children) {

            var childrenStr;
            var resourceLink = "http://dbpedia.org/resource/" + entity.replace(" ", "_");
            if (children.length == 1 && parseInt(children[0]) != NaN) {
                answer = "<a href='" + resourceLink + "' target='_blank'>" + entity.replace("_", " ") + "</a> has " + parseInt(children[0]) + " children";
            }else{
                childrenStr = DBpediaUtils.convertArrayToString(children);
                answer = "<a href='" + resourceLink + "' target='_blank'>" + entity.replace("_", " ") + "</a>'s children are " + childrenStr;
            }
            deferred.resolve(answer);
        }, function(err) {
            deferred.reject(err);
        });
}

PersonPipeline.prototype.answerNetWorth = function(deferred,dataLinks) {

    var dbpediaLink = dataLinks.pages[0].dbpediaLink;
    var entity = DBpediaUtils.extractDBpediaEntity(dbpediaLink);
    new DBpediaUtils.DBpediaQuery().performQuery(entity,"dbp%3Anetworth")
        .then(function(answers) {
            var netWorth = Number(answers[0]).toFixed(0);
            netWorth = parseInt(netWorth).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            var resourceLink = "http://dbpedia.org/resource/" + entity.replace(" ", "_");
            answer = "<a href='" + resourceLink + "' target='_blank'>" + entity.replace("_", " ") + "</a>'s net worth is $" + netWorth;
            deferred.resolve(answer);
        }, function(err) {
            deferred.reject(err);
        });
}
PersonPipeline.prototype.answerSchooling = function(deferred,dataLinks) {

    var dbpediaLink = dataLinks.pages[0].dbpediaLink;
    var entity = DBpediaUtils.extractDBpediaEntity(dbpediaLink);
    new DBpediaUtils.DBpediaQuery().performQuery(entity,"dbp%3AalmaMater")
        .then(function(schools) {
            var schools = DBpediaUtils.convertArrayToString(answers);
            var resourceLink = "http://dbpedia.org/resource/" + entity.replace(" ", "_");
            answer = "<a href='" + resourceLink + "' target='_blank'>" + entity.replace("_", " ") + "</a> attended " + schools;
            deferred.resolve(answer);
        }, function(err) {
            deferred.reject(err);
        });
}
PersonPipeline.prototype.answerSpouse = function(deferred,dataLinks) {

    var dbpediaLink = dataLinks.pages[0].dbpediaLink;
    var entity = DBpediaUtils.extractDBpediaEntity(dbpediaLink);
    new DBpediaUtils.DBpediaQuery().performQuery(entity,"dbp%3Aspouse")
        .then(function(spouses) {

            entity = entity.replace("_", " ")
            var answer;
            if (spouses && spouses.length > 0){
                var spouse = spouses[spouses.length-1];
                var resourceLink = "http://dbpedia.org/resource/" + spouse.replace(" ", "_");
                answer = "<a href='" + resourceLink + "' target='_blank'>" + spouse + "</a> is the spouse of " + entity;
            }else {
                answer = entity + " is not married."
            }
            deferred.resolve(answer);
        }, function(err) {
            deferred.reject(err);
        });
}

// Exported class
module.exports = PersonPipeline;
