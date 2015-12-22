
var bluemix = require('./config/bluemix');
var wdc = require('watson-developer-cloud');

function AlchemyApiUtils(config) {

    // If bluemix credentials (VCAP_SERVICES) are present then override the local credentials
    config.credentials.nlc = extend(config.credentials.nlc, bluemix.getServiceCreds('natural_language_classifier')); // VCAP_SERVICES
    config.credentials.alchemyapi = extend(config.credentials.alchemyapi, bluemix.getServiceCreds('alchemyapi')); // VCAP_SERVICES

    this.alchemyService = wdc.alchemy_language({
        api_key: config.credentials.alchemyapi.api_key,
        version: 'v1'
    });
}


NlcUtils.prototype.extractEntities = function(userInput) {

    var params = {
        text: userInput
    };

    alchemy_language.sentiment(params, function (err, response) {
        if (err)
            console.log('error:', err);
        else
            console.log(JSON.stringify(response, null, 2));
    });
}
