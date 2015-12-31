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
            success: function (res, msg) {
                updateAnswerText(res);
            },
            error: function (res, msg, err) {
                showError(res,msg,err);
            }
        });
    };

    function showError(res,msg,err) {

        var errorText = "Error communicating with the server.<br>"+'Error:' + JSON.stringify(err) + '<br>response: ' + JSON.stringify(res) + '<br>Message: ' + JSON.stringify(msg);
        if (res.responseText) {
            var responseText = JSON.parse(res.responseText);
            if (responseText.message) {
                errorText = responseText.message
            }
        }
        console.log(errorText);

        $("#answerDetailsDiv").toggleClass("hidden",false);
        $("#entityConceptsDiv").toggleClass("hidden",true);
        $("#FactoidDivFactoid").toggleClass("hidden",true);
        $("#answerDiv").html(errorText);

        // Enable search and stop the progress indicator
        ladda.stop();
        $("#questionInput").removeAttr("disabled");
    }

    function updateAnswerText(response) {

        var json = JSON.parse(response);
        $("#answerDetailsDiv").toggleClass("hidden",false);
        $("#entityConceptsDiv").toggleClass("hidden",false);
        $("#FactoidDivFactoid").toggleClass("hidden",false);
        $("#entityConceptsLeftDiv").html(json.data_links.entity_summary);
        $("#entityConceptsDBpediaDiv").html(json.data_links.dbpedia_link_summary);
        $("#entityConceptsFreebaseDiv").html(json.data_links.freebaseLink_summary);
        $("#entityConceptsYagoDiv").html(json.data_links.yago_link_summary);
        $("#entityConceptsOpencycDiv").html(json.data_links.opencyc_link_summary);
        $("#factoidTypeDiv").html(json.top_class);

        if (!json.answer_text || json.answer_text.length == 0) {
            json.answer_text = "Sorry. Data not in Wikipedia, factoid not yet unsupported, or more details needed in question.";
        }
        $("#answerDiv").html(json.answer_text);

        // Enable search and stop the progress indicator
        ladda.stop();
        $("#questionInput").removeAttr("disabled");
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
