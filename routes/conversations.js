var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {

    req.config.conversationStore.getConversations()
        .then(function (conversations) {
            res.render('conversations', {conversations:JSON.stringify(conversations, null, 2)});
        }, function (err) {
            res.render('conversations', {conversations:JSON.stringify(err)});
        });
});

module.exports = router;
