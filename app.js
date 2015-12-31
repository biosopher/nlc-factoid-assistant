// Module dependencies
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var errorHandler = require('error-handler');

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
var WatsonUtils = require('./javascript/watson');
config.watson = new WatsonUtils(app,config);

// Setup routes
var indexJS = require('./routes/index'); //Routes for AJAX callbacks
app.use('/',indexJS);
var conversationsJS = require('./routes/conversations'); //Routes for AJAX callbacks
app.use('/conversations',conversationsJS);

// The IP and port of the Cloud Foundry DEA (Droplet Execution Agent) that hosts this application:
var host = (process.env.VCAP_APP_HOST || 'localhost');
var port = (process.env.VCAP_APP_PORT || 3000);
// Start server
app.listen(port, host);
