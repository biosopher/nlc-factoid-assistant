var https = require('https');
var url = require('url');
var Q = require('q');
var conversationStore = require('./javascript/ConversationStore');

//************ Constructor **************//
function WatsonUtils(config, app) {

    // Load local config including credentials for running app locally (but services remotely)
    var configFPath = "../watson_config.json";
    if (fs.existsSync(configFPath)) {

        try {
            var data = fs.readFileSync(configFPath, "utf8");
            config.credentials = JSON.parse(data);
        } catch (err) {
            console.log("Unable to load local credentials.json:\n" + JSON.stringify(err));
        }
    }

    // Create Service utils classes
    nlcUtils = new NlcUtils(config);
    alchemyUtils = new AlchemyApiUtils(config);

    //************ Supported URL paths **************//
    app.post("/answerFactoid", function(req,res) {

        nlcUtils.determineUserIntent(req.body.conversation,res)
            .then(function(userIntent) {

                alchemyUtils.extractEntities(req.body.conversation,res)
                    .then(function(entities) {

                        // Save conversation to a Mongo database for later analysis.
                        conversationStore.storeConversation(conversation);

                        res.status(200).json({intent: userIntent, entities: entities});
                    }, function(err) {
                        callback("Failed to extract entities for '" + req.body + ". " + JSON.stringify(err));
                    });
            }, function(err) {
                callback("Failed to extract user intent for '" + req.body + ". " + JSON.stringify(err));
            });
    });
}

WatsonUtils.prototype.sendToServer = function(type, path, credentials, body, extraHeaders) {

    var deferred = Q.defer();
    var options = {
        host: url.parse(credentials.url).hostname,
        path: credentials.url,
        method: type,
        auth: credentials.username + ":" + credentials.password, // http library base64 encodes for us
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'X-SyncTimeout': 30
        }
    };

    var request = https.request(options, function (response) {

        response.setEncoding('utf8');
        var data = "";
        response.on('data', function (chunk) {
            data += chunk;
        });
        response.on('end', function () {

            var json = null;
            var errorMessage = null;
            try {
                if (data.length) {
                    json = JSON.parse(data);
                } else {
                    errorMessage = "Invalid server response: " + JSON.stringify(data);
                }
            } catch (err) {
                errorMessage = "Invalid server response: " + JSON.stringify(data) + ". Error: " + JSON.stringify(err);
            }

            if (errorMessage) {
                var error = {
                    statusCode: 500,
                    message: errorMessage
                };
                deferred.reject(error);
            } else {
                deferred.resolve(json);
            }
        });
        response.on('error', function (err) {
            var error = {
                statusCode: 500,
                message: JSON.stringify(err),
            };
            deferred.reject(error);
        });
    });
    request.on('uncaughtException', function (exception) {
        var error = {
            statusCode: 500,
            message: JSON.stringify(exception),
        };
        deferred.reject(error);
    });
    request.on('error', function (err) {
        var error = {
            statusCode: 500,
            message: JSON.stringify(err),
        };
        deferred.reject(error);
    });
    if (body) {
        request.write(body);
    }
    request.end();
    return deferred.promise;
};
