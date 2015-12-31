var bluemix  = require('../config/bluemix');
var extend      = require('util')._extend;
var Q = require('q');
var wdc = require('watson-developer-cloud');

//************ Constructor **************//
function NlcUtils(watson) {

    this.watson = watson;
    this.isClassifierAvailable = false;

    // If bluemix credentials (VCAP_SERVICES) are present then override the local credentials
    watson.config.nlc = extend(watson.config.nlc, bluemix.getServiceCreds('natural_language_classifier')); // VCAP_SERVICES

    // Setup our NLC + AlchemyAPI services running in the WDC module
    this.nlcService = wdc.natural_language_classifier({
        username: watson.config.nlc.username,
        password: watson.config.nlc.password,
        version: 'v1'
    });

    this.isTestingClassifierAvailability = false;
    this.testClassifierAvailable()
}

NlcUtils.prototype.isAvailableForUse = function() {

    return this.isClassifierAvailable;
}

NlcUtils.prototype.classifierInitCompleted = function(errMessage) {

    this.isClassifierAvailable = (errMessage == undefined || errMessage == null);
    if (errMessage) {
        console.log({errMessage : errMessage});
    }else{
        console.log("Classifier is available!");
    }
    this.isTestingClassifierAvailability = false;
}

NlcUtils.prototype.testClassifierAvailable = function() {

    if (this.isTestingClassifierAvailability) {
        // Prevent duplicate init processes
        return;
    }

    this.isTestingClassifierAvailability = true;
    var internalThis = this;
    this.nlcService.list({},
        function(err, response) {

            var errMessage = null;
            if (err)
                internalThis.classifierInitCompleted("Error obtaining classifiers from NLC service with response:\n" + JSON.stringify(response)+"\nError:\n" + JSON.stringify(err));
            else {
                var classifierName = internalThis.watson.config.nlc.classifier_name;
                response.classifiers.forEach(function(classifier, index) {
                    if (classifier.name == classifierName) {
                        internalThis.nlcClassifier = classifier;
                        internalThis.validateClassifierAvailable(internalThis.watson);
                    }
                });

                if (!internalThis.nlcClassifier) {
                    internalThis.classifierInitCompleted("No NLC classifier named '" + classifierName + "' found in the NLC service.\n" + JSON.stringify(response));
                }
            }
        });
}

NlcUtils.prototype.validateClassifierAvailable = function() {

    var internalThis = this;
    this.nlcService.status({classifier_id : this.nlcClassifier.classifier_id},
        function(err, response) {

            if (err)
                internalThis.classifierInitCompleted("Error validating classifier is ready w/response:\n" + JSON.stringify(response)+"\nError:\n" + JSON.stringify(err));
            else {
                if (response.status == "Available") {
                    internalThis.classifierInitCompleted();
                }else{
                    internalThis.classifierInitCompleted("Classifier not yet ready.\n" + JSON.stringify(response));
                }
            }
        });
}

NlcUtils.prototype.determineUserIntent = function(userText) {

    var deferred = Q.defer();

    this.nlcService.classify({
            text: userText,
            classifier_id: this.nlcClassifier.classifier_id },
        function(err, response) {
            if (err)
                deferred.reject(err);
            else
                deferred.resolve(response);
        });
    return deferred.promise;
}

// Exported class
module.exports = NlcUtils;
