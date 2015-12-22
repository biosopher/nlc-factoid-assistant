var bluemix = require('./config/bluemix');
var wdc = require('watson-developer-cloud');

function NlcUtils(config) {

    this.config = config;
    this.isCLassifierInitialized = false;
    this.nlcClassifier = null;

    // If bluemix credentials (VCAP_SERVICES) are present then override the local credentials
    config.credentials.nlc = extend(config.credentials.nlc, bluemix.getServiceCreds('natural_language_classifier')); // VCAP_SERVICES

    // Setup our NLC + AlchemyAPI services running in the WDC module
    this.nlcService = wdc.natural_language_classifier({
        username: config.credentials.nlc.username,
        password: config.credentials.nlc.password,
        version: 'v1'
    });

    loadClassifier(config);
}

function determineUserIntent(config) {

    natural_language_classifier.list({},
        function(err, response) {

            var errMessage = null;
            if (err)
                errMessage = "Error obtaining classifiers from NLC service with response:\n" + JSON.stringify(response)+"\nError:\n" + JSON.stringify(err);
            else {
                console.log("classifiers found: " + JSON.stringify(response, null, 2));
                var json = JSON.parse(response);
                var classifierName = config.watson.natural_language_classifier.classifier_name;
                json.classifiers.forEach(function(classifier, index) {
                    if (classifier.name == classifierName) {
                        nlcClassifier = classifier;
                    }
                });
                if (nlcClassifier == null) {
                    errMessage = "No NLC classifier named '" + classifierName + "' found in the NLC service.\n" + JSON.stringify(data);
                    /*$assistantLoading.hide();
                     $assistantError.find('.errorMsg').html();
                     $assistantError.show();*/
                    console.log(errMessage);
                }
            }
        });
}

NlcUtils.prototype.determineUserIntent = function() {
}

NlcUtils.prototype.isCLassifierInitialized = function() {
    return isCLassifierInitialized;
}
