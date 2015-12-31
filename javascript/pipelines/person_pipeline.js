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
        case "person-birthdate":
            this.answerBirthday(deferred,dataLinks);
            break;
        case "person-birthplace":
            this.answerBirthPlace(deferred,dataLinks);
            break;
        case "person-children":
            this.answerChildren(deferred,dataLinks);
            break;
        case "person-net_worth":
            this.answerNetWorth(deferred,dataLinks);
            break;
        case "person-schooling":
            this.answerSchooling(deferred,dataLinks);
            break;
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

    DBpediaUtils.performQueryAndResolve(dataLinks,"dbp%3AbirthDate", false, deferred, function(entity,answers) {
        var date = DateUtils.getDateAsString(answers[0]);
        var yearsSinceNow = DateUtils.getYearsSinceNow(answers[0]);
        return DBpediaUtils.linkForEntity(entity) + " is " + yearsSinceNow + " years old and was born on " + date;
    });
}

PersonPipeline.prototype.answerBirthPlace = function(deferred,dataLinks) {

    DBpediaUtils.performQueryAndResolve(dataLinks,"dbp%3AbirthPlace", false, deferred, function(entity,answers) {
       return DBpediaUtils.linkForEntity(entity) + " was born in " + DBpediaUtils.linkForEntity(answers[0]);
    });
}

PersonPipeline.prototype.answerChildren = function(deferred,dataLinks) {

    DBpediaUtils.performQueryAndResolve(dataLinks,"dbp%3Achildren", false, deferred, function(entity,answers) {
        if (children.length == 1 && parseInt(children[0]) != NaN) {
            // Handle when children are only provided as a number.
            answer = DBpediaUtils.linkForEntity(entity) + " has " + parseInt(children[0]) + " children";
        }else{
            var childrenStr = DBpediaUtils.convertArrayToString(children);
            answer = DBpediaUtils.linkForEntity(entity) + "'s children are " + childrenStr;
        }
        return answer;
    });
}

PersonPipeline.prototype.answerNetWorth = function(deferred,dataLinks) {

    DBpediaUtils.performQueryAndResolve(dataLinks,"dbo%3Anetworth", false, deferred, function(entity,answers) {
        var netWorth = Number(answers[0]).toFixed(0);
        netWorth = netWorth.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return DBpediaUtils.linkForEntity(entity) + "'s net worth is $" + netWorth;
    });
}
PersonPipeline.prototype.answerSchooling = function(deferred,dataLinks) {

    DBpediaUtils.performQueryAndResolve(dataLinks,"dbp%3AalmaMater", false, deferred, function(entity,answers) {
        var schools = DBpediaUtils.convertDBpediaLinkArrayToLinksString(answers);
        return DBpediaUtils.linkForEntity(entity) + " attended " + schools;
    });
}
PersonPipeline.prototype.answerSpouse = function(deferred,dataLinks) {

    DBpediaUtils.performQueryAndResolve(dataLinks,"dbp%3Aspouse", false, deferred, function(entity,answers) {
        if (answers.length > 0){
            var spouse = answers[answers.length-1];
            return DBpediaUtils.linkForEntity(spouse) + " is the spouse of " + DBpediaUtils.linkForEntity(entity);
        }else {
            return DBpediaUtils.linkForEntity(entity) + " is not married."
        }
    });
}

// Exported class
module.exports = PersonPipeline;
