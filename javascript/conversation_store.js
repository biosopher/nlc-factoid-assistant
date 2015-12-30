var cloudant = require('cloudant');
var bluemix  = require('../config/bluemix');
var extend   = require('util')._extend;

function ConversationStore(watson) {

    this.watson = watson;
    // If bluemix credentials (VCAP_SERVICES) are present then override the local credentials
    watson.config.cloudant =  extend(watson.config.cloudant, bluemix.getServiceCreds('cloudantNoSQLDB')); // VCAP_SERVICES

    if (watson.config.cloudant.url.indexOf("http") >= 0) {

        // Otherwise the use hasn't configured the app to track user text submissions.

        this.cloudantDB = null;
        var internalThis = this;
        this.cloudantService = cloudant({account:watson.config.cloudant.username, password:watson.config.cloudant.password});
        this.cloudantService.db.list(function(err, allDbs) {

            //destroyDatabase();
            if(typeof allDbs != 'undefined'){
                for (var i = 0; i < allDbs.length; i++) {
                    if (allDbs[i] == internalThis.watson.config.cloudant.db_name) {
                        internalThis.cloudantDB = internalThis.cloudantService.db.use(internalThis.watson.config.cloudant.db_name)
                        console.log('Cloudant database ready');
                        return;
                    }
                }
            }
            internalThis.createDatabase();
        });
    }
}

ConversationStore.prototype.storeConversation = function(factoidObj) {

    // if{} here has two effects:
    // 1. Avoid errors if cloudant service not enabled
    // 2. database creation can take awhile first time app launches so prevent errors
    if (this.cloudantDB) {
        factoidObj._id = factoidObj.startTimestamp;
        var internalThis = this;
        this.cloudantDB.insert(factoidObj,function(err, body, header) {
            if (err) {
                internalThis.updateConversation(factoidObj);
            }else{
                var factoidJson = JSON.stringify(factoidObj, null, 2);
                console.log('Inserted conversation: ' + factoidJson);
            }
        });
    }
}

ConversationStore.prototype.updateConversation = function(factoidObj) {

    var internalThis = this;
    this.cloudantDB.get(factoidObj._id,{ revs_info: true },function(err, body, header) {
        if (err) {
            console.log('cloudant.get failed', JSON.stringify(err));
            internalThis.storeConversation(factoidObj);
        }else{
            factoidObj._rev = body._rev;
            internalThis.storeConversation(factoidObj);
        }
    });
}

ConversationStore.prototype.printConversations = function(factoidObj) {

    var conversations = initDatabase();

    // fetch the primary index
    conversations.list(function(err, body){
        if (err) {
            // something went wrong!
            throw new Error(err);
        } else {
            // print all the documents in our database
            console.log(body);
        }
    });
}

ConversationStore.prototype.createDatabase = function() {
    var internalThis = this;
    this.cloudantService.db.create(this.watson.config.cloudant.db_name, function(err) {
        if (err) {
            console.log('Failure to create the cloudant database', JSON.stringify(err));
        } else {
            internalThis.cloudantDB = internalThis.cloudantService.db.use(internalThis.watson.config.cloudant.db_name)
            console.log('Created Cloudant database');
        }
    });
}

ConversationStore.prototype.destroyDatabase = function() {
    var internalThis = this;
    this.cloudantService.db.destroy(CONVERSATIONS_DATABASE, function(err) {
        console.log('Destroyed Cloudant database');
        internalThis.createDatabase();
    });
}

// Exported class
module.exports = ConversationStore;
