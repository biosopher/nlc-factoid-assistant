// Module dependencies
var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    errorHandler = require('error-handler');

var config = {};
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(__dirname + '/public')); //setup static public directory
app.use(errorHandler);
var bluemix = require('./config/bluemix');

// Jade setup
app.set('views',path.join(__dirname, 'views')); //optional since express defaults to CWD/views
app.set('view engine','jade');

app.all('*', function(req,res,next) {
    req.config = config;
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

// Initialize Watson
config.watson = require('./routes/watson.js')(config,app);

// Setup routes
var indexJS = require('./routes/index'); //Routes for AJAX callbacks
app.use('/',indexJS);


if (app.get('env') === 'development' || app.get('env') === 'dev') {
    app.use(function(err, req, res, next) {
	console.error("error encountered",err.message);
        res.status(500);
    });
}

// The IP and port of the Cloud Foundry DEA (Droplet Execution Agent) that hosts this application:
var host = (process.env.VCAP_APP_HOST || 'localhost');
var port = (process.env.VCAP_APP_PORT || 3000);
// Start server
app.listen(port, host);
