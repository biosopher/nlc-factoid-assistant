var cloudant = require('cloudant');
var bluemix  = require('../config/bluemix');
var extend   = require('util')._extend;
var Q = require('q');

function ConversationStore(watson,config) {

    config.conversationStore = this;
    this.watson = watson;

    // If bluemix credentials (VCAP_SERVICES) are present then override the local credentials
    watson.config.cloudant =  extend(watson.config.cloudant, bluemix.getServiceCreds('cloudantNoSQLDB')); // VCAP_SERVICES

    if (watson.config.cloudant.url.indexOf("http") >= 0) {

        // Otherwise the use hasn't configured the app to track user text submissions.

        this.conversationsDB = null;
        var internalThis = this;
        this.cloudantService = cloudant({account:watson.config.cloudant.username, password:watson.config.cloudant.password});
        this.cloudantService.db.list(function(err, allDbs) {

            // internalThis.destroyDatabase();
            if(typeof allDbs != 'undefined'){
                for (var i = 0; i < allDbs.length; i++) {
                    if (allDbs[i] == internalThis.watson.config.cloudant.db_name) {
                        internalThis.conversationsDB = internalThis.cloudantService.db.use(internalThis.watson.config.cloudant.db_name)
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
    // 2. database creation can take awhile first time app launches so prevent errors if it isn't ready for 1st transactions
    if (this.conversationsDB) {
        factoidObj._id = factoidObj.start_timestamp+"";;
        var internalThis = this;
        this.conversationsDB.insert(factoidObj,function(err, body) {
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
    this.conversationsDB.get(factoidObj._id,{ revs_info: true },function(err, body, header) {
        if (err) {
            console.log('cloudant.get failed', JSON.stringify(err));
            internalThis.storeConversation(factoidObj); // Just try to store it directly as probably trying to update a non-existent record
        }else{
            factoidObj._rev = body._rev;
            internalThis.storeConversation(factoidObj);
        }
    });
}

function getPrettyConversation(conversation) {

    var pretty = {};
    if (conversation.doc && conversation.doc.user_text) {
        var doc = conversation.doc;
        pretty.user_text = doc.user_text;
        if (doc.response) {
            pretty.answer_text = doc.response.answer_text;
            pretty.top_class = doc.response.top_class;

            if (pretty.answer_text && pretty.answer_text.length > 100) {
                pretty.answer_text = pretty.answer_text.substring(0, 100) + '...';
            }
        }
    }
    return pretty;
}

ConversationStore.prototype.getConversations = function() {

    var deferred = Q.defer();
    var internalThis = this;
    if (this.conversationsDB) {
        this.conversationsDB.list(function(err, body) {
            if (err) {
                deferred.reject(err);
            }else{
                // Create ID array
                var query = {};
                query.keys = [];
                for (var i = 0; i < body.rows.length; i++) {
                    query.keys[i] = body.rows[i].key;
                }
                internalThis.conversationsDB.fetch(query,function(err, body) {
                    var response = {};
                    response.conversations = [];
                    for (var i = 0; i < body.rows.length; i++) {
                        response.conversations[i] = getPrettyConversation(body.rows[i]);
                    }
                    deferred.resolve(response);
                });
            }
        });
    }else{
        deferred.reject("Database startup in-progress");
    }
    return deferred.promise;
}

ConversationStore.prototype.createDatabase = function() {
    var internalThis = this;
    this.cloudantService.db.create(this.watson.config.cloudant.db_name, function(err) {
        if (err) {
            console.log('Failure to create the cloudant database', JSON.stringify(err));
        } else {
            internalThis.conversationsDB = internalThis.cloudantService.db.use(internalThis.watson.config.cloudant.db_name)
            console.log('Created Cloudant database');
        }
    });
}

ConversationStore.prototype.destroyDatabase = function() {
    var internalThis = this;
    this.cloudantService.db.destroy(internalThis.watson.config.cloudant.db_name, function(err) {
        console.log('Destroyed Cloudant database');
        internalThis.createDatabase();
    });
}

// Exported class
module.exports = ConversationStore;
