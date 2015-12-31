/*global $:false */ // Fixes "'$' is not defined." error caused by JSHint
var ConversationUtils = {};

ConversationUtils.App = function() {

    function displayConversations() {

        var conversationsJson = jQuery.parseJSON($("#conversationsHiddenDiv").text());
        if (conversationsJson.conversations && conversationsJson.conversations.length > 0) {

            $("#conversationsHiddenDiv").toggleClass("hidden",true);
            var tableContents = "<table>";
            for (var i = 0; i < conversationsJson.conversations.length;i++) {

                tableContents += "<tr>";
                var conversation = conversationsJson.conversations[i];
                var topClass = conversation.top_class;
                if (!topClass) {
                    conversation.top_class = "NOT AVAILABLE";
                }
                tableContents += "<td><span class='topClass'>";
                tableContents += conversation.top_class;
                tableContents += "</span></td>";
                tableContents += "<td><span class='userText'>";
                tableContents += conversation.user_text;
                tableContents += "</td>";
                if (conversation.answer_text) {
                    tableContents += "</td><td>";
                    tableContents += conversation.answer_text;
                    tableContents += "</td>";
                }
                tableContents += "</td></tr>";
            }
            tableContents += "</table>";
            $('#conversationsDiv').html(tableContents);
        }else{
            $('#conversationsDiv').html("No conversations found");
        }

    }

    // Initialize the application
    var init = function() {

        displayConversations();
    }

    // Expose privileged methods
    return {
        init : init
    };
}(); // Don't delete the circle brackets...required!

ConversationUtils.App.init();
