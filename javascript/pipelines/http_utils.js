var Q = require('q');
var http = require('http');
var https = require('https');
var url = require('url');

//************ Constructor **************//
function HttpUtils() {
}

HttpUtils.prototype.sendToServer = function(type, serverUrl, body, extraHeaders, username, password) {

    var deferred = Q.defer();

    var urlParts = url.parse(serverUrl);
    var options = {
        hostname: urlParts.hostname,
        path: urlParts.path,
        method: type
    };

    var httpModule = http;
    if (username) {
        // http library base64 encodes for us
        options.credentials = username + ":" + password;
        httpModule = https;
    }

    console.log("Contacting server with options: " + JSON.stringify(options, null, 2));
    var request = httpModule.request(options, function (response) {

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

// Exported class
module.exports = HttpUtils;
