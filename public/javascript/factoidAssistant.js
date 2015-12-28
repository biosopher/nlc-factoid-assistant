/*global $:false */ // Fixes "'$' is not defined." error caused by JSHint
var FactoidAssistant = {};
var exampleQuestionUX;
var ladda;

FactoidAssistant.App = function() {

    // Ask a question.
    // Invoke the Node.js REST service. The Node.js
    // service, in turn, invokes the IBM Watson QAAPI
    // and returns to us the QAAPI response
    function ask(question) {

        $("#answerDetailsDiv").toggleClass("hidden",true);
        if (question.length < 10 || question.split(" ").length < 3) {
            // Ensure a minimal question is provided.
            alert("A valid question is required.");
            return;
        } else if (question.length > 500) {
            // Ensure a minimal question is provided.
            alert("Questions must must be shorter than 500 chars.");
            return;
        }

        // Create a Ladda reference object (used for loading indicator on button)
        if (!ladda) {
            ladda = Ladda.create(document.querySelector('button'));
        }
        ladda.start();

        // Hide stuff
        var infoBubble = $('#infoBubble');
        infoBubble.toggleClass("hidden", true);

        var questionInput = $("#questionInput");
        questionInput.attr("disabled", "disabled");

        var bottomDetailsDiv = $('#bottomDetailsDiv');
        bottomDetailsDiv.toggleClass("hidden", true);

        // Update CSS for 'answers displayed'
        $('#watsonImg').toggleClass("watsonImg", false);
        $('#watsonImg').toggleClass("watsonImgAnswers", true);
        $('#askButtonSpan').toggleClass("hidden", false);
        $('#searchDiv').toggleClass("searchDiv", false);
        $('#questionInput').toggleClass("questionInput", false);
        $('#questionInput').toggleClass("questionInputAnswers", true);

        // POST the question request to the Node.js REST service
        $.ajax({
            type: 'POST',
            data: {
                'userText': question.trim()
            },
            dataType: "json",
            url: '/answerFactoid',
            success: function (r, msg) {
                var json = JSON.parse(r);
                if (json.entities_response == undefined && json.concepts_response == undefined) {
                    alert("Error communicating with the server.  Invalid response received.");
                } else {
                    updateAnswerText(json);
                }

                // Enable search and stop the progress indicator
                ladda.stop();
                questionInput.removeAttr("disabled");
            },
            error: function (r, msg, e) {
                alert('Error:' + JSON.stringify(e) + '\nresponse: ' + JSON.stringify(r) + '\nMessage: ' + JSON.stringify(msg));

                // Enable search and stop progress indicator
                ladda.stop();
                questionInput.removeAttr("disabled");
            }
        });
    };

    function updateAnswerText(response) {

        $("#answerDetailsDiv").toggleClass("hidden",false);
        $("#entityConceptsLeftDiv").html(response.dataLinks.summary);
        $("#entityConceptsDBpediaDiv").html(response.dataLinks.dbpediaLinkSummary);
        $("#entityConceptsFreebaseDiv").html(response.dataLinks.freebaseLinkSummary);
        $("#entityConceptsYagoDiv").html(response.dataLinks.yagoLinkSummary);
        $("#entityConceptsOpencycDiv").html(response.dataLinks.opencycLinkSummary);

        if (!response.answerText || response.answerText.length == 0) {
            response.answerText = "Sorry your factoid type is not yet unsupported.";
        }
        $("#answerDiv").text(response.answerText);
    }

    // Initialize the application
    var init = function() {

        // Wire the search form to ask a question on submit
        $("#questionForm").submit(function(e) {
            ask($("#questionInput").val());
        });

        // Initialize Example Questions
        exampleQuestionUX = new ExampleQuestionUX(ask);
    };

    // Expose privileged methods
    return {
        init : init
    };
}(); // Don't delete the circle brackets...required!

FactoidAssistant.App.init();
