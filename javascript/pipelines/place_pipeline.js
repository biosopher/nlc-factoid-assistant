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

    var dbpediaLink = dataLinks.pages[0].dbpediaLink;
    var entity = DBpediaUtils.extractDBpediaEntity(dbpediaLink);
    new DBpediaUtils.DBpediaQuery().performQuery(entity,"dbp%3AareaCode")
        .then(function(answers) {
            var areaCode = DBpediaUtils.extractDBpediaEntity(answers[0])
            if (areaCode) {
                var entityLink = "http://dbpedia.org/resource/" + entity.replace(" ","_");
                var answer = "The area code for <a href='"+dbpediaLink+"' target='_blank'>"+ entity.replace("_"," ") + "</a> is " + areaCode;
                deferred.resolve(answer);
            }else{
                deferred.resolve(null);
            }
        }, function(err) {
            deferred.reject(err);
        });
}

PlacePipeline.prototype.answerCapital = function(deferred,dataLinks) {

    // var dbpediaLink = DBpediaUtils.getDBpediaLinkWithType(dataLinks,["StateOrCounty"]);
    var dbpediaLink = dataLinks.pages[0].dbpediaLink;
    var entity = DBpediaUtils.extractDBpediaEntity(dbpediaLink);
    new DBpediaUtils.DBpediaQuery().performQuery(entity,"dbp%3Acapital")
        .then(function(answers) {
            var capital = DBpediaUtils.extractDBpediaEntity(answers[0])
            if (capital) {
                var capitalLink = "http://dbpedia.org/resource/" + capital.replace(" ","_");
                var entityLink = "http://dbpedia.org/resource/" + entity.replace(" ","_");
                var answer = "<a href='"+capitalLink+"' target='_blank'>"+ capital.replace("_"," ") + "</a> is the capital of <a href='"+entityLink+"' target='_blank'>"+ entity.replace("_"," ") + "</a>";
                deferred.resolve(answer);
            }else{
                deferred.resolve(null);
            }
        }, function(err) {
            deferred.reject(err);
        });
}

PlacePipeline.prototype.answerGovernorMayor = function(deferred,dataLinks) {

    var dbpediaLink = dataLinks.pages[0].dbpediaLink;
    var entity = DBpediaUtils.extractDBpediaEntity(dbpediaLink);

    // First test for governor
    new DBpediaUtils.DBpediaQuery().performQuery(entity,"dbp%3Agovernor")
        .then(function(answers) {
            if (answers && answers.length > 0) {
                var governor = answers[0];
                var governorLink = "http://dbpedia.org/resource/" + governor.replace(" ","_");
                var entityLink = "http://dbpedia.org/resource/" + entity.replace(" ","_");
                var answer = "<a href='"+governorLink+"' target='_blank'>"+ governor.replace("_"," ") + "</a> is the governor of <a href='"+entityLink+"' target='_blank'>"+ entity.replace("_"," ") + "</a>";
                deferred.resolve(answer);
            }else{

                // Else try mayor
                new DBpediaUtils.DBpediaQuery().performQuery(entity,"dbp%3A2010pop")
                    .then(function(answers) {
                        if (answers && answers.length > 0) {
                            var mayor = answers[0];
                            var mayorLink = "http://dbpedia.org/resource/" + mayor.replace(" ","_");
                            var entityLink = "http://dbpedia.org/resource/" + entity.replace(" ","_");
                            var answer = "<a href='"+mayorLink+"' target='_blank'>"+ mayor.replace("_"," ") + "</a> is the mayor of <a href='"+entityLink+"' target='_blank'>"+ entity.replace("_"," ") + "</a>";
                            deferred.resolve(answer);
                        }
                    }, function(err) {
                        deferred.reject(err);
                    });
            }
        }, function(err) {
            deferred.reject(err);
        });
}

PlacePipeline.prototype.answerCompletionDate = function(deferred,dataLinks) {

    var dbpediaLink = dataLinks.pages[0].dbpediaLink;
    var entity = DBpediaUtils.extractDBpediaEntity(dbpediaLink);
    new DBpediaUtils.DBpediaQuery().performQuery(entity,"dbp%3AcompletionDate")
        .then(function(answers) {
            var date = answers[0];
            if (date.indexOf("-")>0) {
                // parse date string else assume this is just a year value
                date = DateUtils.getDateAsString();
            }
            var entityLink = "http://dbpedia.org/resource/" + entity.replace(" ","_");
            var answer = "<a href='"+entityLink+"' target='_blank'>"+ entity.replace("_"," ") + "</a> was completed on " + date;
        }, function(err) {
            deferred.reject(err);
        });
}

PlacePipeline.prototype.answerPopulation = function(deferred,dataLinks) {

    var dbpediaLink = dataLinks.pages[0].dbpediaLink;
    var entity = DBpediaUtils.extractDBpediaEntity(dbpediaLink);

    // First use the format most popular with cities and countries
    new DBpediaUtils.DBpediaQuery().performQuery(entity,"dbp%3ApopulationTotal")
        .then(function(answers) {
            if (answers && answers.length > 0) {
                var population = answers[0];
                population = population.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                var entityLink = "http://dbpedia.org/resource/" + entity.replace(" ","_");
                var answer = "<a href='"+entityLink+"' target='_blank'>"+ entity.replace("_"," ") + "</a>'s population is " + population;
                deferred.resolve(answer);
            }else{

                // Else oddly states in America have a different format
                new DBpediaUtils.DBpediaQuery().performQuery(entity,"dbp%3A2010pop")
                    .then(function(answers) {
                        if (answers && answers.length > 0) {
                            var population = DBpediaUtils.extractDBpediaEntity(answers[0])
                            population = population.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                            var entityLink = "http://dbpedia.org/resource/" + entity.replace(" ","_");
                            var answer = "<a href='"+entityLink+"' target='_blank'>"+ entity.replace("_"," ") + "</a>'s population as of the 2010 census was " + population;
                            deferred.resolve(answer);
                        }
                    }, function(err) {
                        deferred.reject(err);
                    });
            }
        }, function(err) {
            deferred.reject(err);
        });
}

// Exported class
module.exports = PlacePipeline;
