/*
   Licensed Materials - Property of IBM
   Copyright IBM Corp. 2015  All Rights Reserved
   US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
*/

/*global $:false */ // Fixes "'$' is not defined." error caused by JSHint
var WatsonTravel = WatsonTravel || {};
var ladda;

WatsonTravel.App = function() {

    // Constants
    var EXAMPLE_QUESTION_LINK = "example_question_link_";

    // Global App Vars
    var questionText;
    var eventsAlreadyAdded = [];
    var visibleExampleLinks = [];
    var hiddenExampleLinks = [];
    var maxAvailableExampleCount;
    var answerObjects = [];
    var isTravelDemo;
    var firstTwoAnswers;
    var hasDBpediaResponseReturned;
    var hasDBpediaEntityInfo;

    var populateAnswerTemplate = function(answerObj) {

        // Create answer html from template
        var answersWrapper = $('#answersWrapper');
        var template = $('#answerTemplate').clone();
        template.attr("id","answer"+answerObj.index);
        template.toggleClass("hidden",false);

        template.appendTo(answersWrapper);

        // Configure more... link
        var moreLink = template.find('.moreLink');
        moreLink.data("answerIndex",answerObj.index);
        moreLink.attr("id","moreLink"+answerObj.index);

        var evidenceDiv = template.find('.evidenceDiv');
        evidenceDiv.data("answerIndex",answerObj.index);
        evidenceDiv.attr("id","evidenceDiv"+answerObj.index);

        var yesFeedbackDiv = template.find('#feedbackYesDiv');
        var noFeedbackDiv = template.find('#feedbackNoDiv');
        var partialFeedbackDiv = template.find('#feedbackPartialDiv');
        var yesFeedbackLink = template.find('#feedbackYesLink');
        var noFeedbackLink = template.find('#feedbackNoLink');
        var partialFeedbackLink = template.find('#feedbackPartialLink');
        var commentFeedbackLink = template.find('#feedbackCommentLink');
        var confidenceValue = template.find('.confidenceValue');
        var pipelineValue = template.find('.pipelineValue');

        // Assign unique IDs to keep HTML clean/accurate...also required for many of these
        yesFeedbackDiv.attr("id","feedbackYesDiv"+answerObj.index);
        noFeedbackDiv.attr("id","feedbackNoDiv"+answerObj.index);
        partialFeedbackDiv.attr("id","feedbackPartialDiv"+answerObj.index);
        yesFeedbackLink.attr("id","feedbackYesLink"+answerObj.index);
        noFeedbackLink.attr("id","feedbackNoLink"+answerObj.index);
        partialFeedbackLink.attr("id","feedbackPartialLink"+answerObj.index);
        commentFeedbackLink.attr("id","feedbackCommentLink"+answerObj.index);

        // Provide answer index for later lookup by click methods
        yesFeedbackLink.data("answerIndex",answerObj.index);
        noFeedbackLink.data("answerIndex",answerObj.index);
        partialFeedbackLink.data("answerIndex",answerObj.index);
        commentFeedbackLink.data("answerIndex",answerObj.index);

        confidenceValue.html(Number((answerObj.answer.confidence*100).toFixed(2))+"% confidence");

        var pipelines = answerObj.answer.pipeline.split(",");
        var pipelinesStr = "";
        var pipelinesSuffix = pipelines.length == 1 ? "pipeline" : "pipelines";
        for (var i = 0; i < pipelines.length; i++) {
            if (pipelinesStr.length > 0) {
                if (pipelines.length > 2) {
                    pipelinesStr += ", ";
                }
                if (i == pipelines.length-1) {
                    pipelinesStr += " & ";
                }
            }
            pipelinesStr += pipelines[i];
        }
        pipelineValue.html(pipelinesStr.toLowerCase() + " "+ pipelinesSuffix);

        // Shorten answer text
        var fullAnswer = answerObj.evidence.text;
        var charsToShow = fullAnswer.length > 225 ?  225 : fullAnswer.length;
        var shortAnswer = fullAnswer.substring(0,charsToShow)+"...";

        // Store for later reuse
        var answerText = template.find('.answerText');
        answerText.attr("id","answerText"+answerObj.index);
        answerText.data("shortAnswer",shortAnswer);

        // Highlight the formatted answer and save for later display
        var formattedAnswer = answerObj.answer.formattedText;
        answerText.html(formattedAnswer);
        TextHighlighter.hightlight(answerText,fullAnswer);
        answerText.data("formattedAnswer",answerText.html());
        answerText.html(shortAnswer);

        // Events are added to the document and not the html element so avoid adding duplicats.
        if (eventsAlreadyAdded[answerObj.index] == null) {
            $(document).on('click', '#feedbackYesLink'+answerObj.index, function(event) {
                return answerFeedback("1",event);
            });
            $(document).on('click', '#feedbackNoLink'+answerObj.index, function(event) {
                return answerFeedback("-1",event);
            });
            $(document).on('click', '#feedbackPartialLink'+answerObj.index, function(event) {
                return answerFeedback("9",event);
            });
            $(document).on('click', '#commentLink'+answerObj.index, function(event) {
                showCommentModal(event);
            });
            $(document).on('click', '#moreLink'+answerObj.index, function(event) {
                toggleMore(event);
            });
            eventsAlreadyAdded[answerObj.index] = true;
        }
    };

    function confidenceRank(answerA,answerB) {
        if (answerA.answer.confidence< answerB.answer.confidence){
            return 1;
        }else if (answerA.answer.confidence > answerB.answer.confidence){
            return -1;
        }
        return 0;
    };

    function extractAnswers(pipelineResponse) {
        if (pipelineResponse && pipelineResponse.question && pipelineResponse.question.answers) {
            questionText = pipelineResponse.question.questionText;
            var answers = pipelineResponse.question.answers;
            for (var i = 0; i < answers.length; i++) {
                var answerObj = [];
                answerObjects[answerObjects.length] = answerObj;
                answerObj.answer = answers[i];
                answerObj.pipelineIndex = i;
                answerObj.questionId = pipelineResponse.question.id;
                answerObj.evidence = pipelineResponse.question.evidencelist[i];
            }
        }
    };

    // Display the answers return in the response, r, in
    function displayAnswers(r) {

        var bottomDetailsDiv = $('#bottomDetailsDiv');
        bottomDetailsDiv.toggleClass("hidden",false);

        var searchInputWrapper = $('#searchInputWrapper');
        searchInputWrapper.toggleClass("searchInputWrapperNoAnswer",false);
        searchInputWrapper.toggleClass("searchInputWrapperAnswers",true);

        var weaResponse = r[0]; // Answers from the WEA pipeline
        var factoidResponse = r[1]; // Answers from the factoid pipeline

        answerObjects = [];
        extractAnswers(weaResponse);
        var answersWrapper = $('#answersWrapper');
        answersWrapper.empty();
        firstTwoAnswers = "";
        for (var i = 0; i < answerObjects.length; i++) {
            var answerObj = answerObjects[i];
            answerObj.index = i;
            populateAnswerTemplate(answerObj);

            if (i < 2) {
                firstTwoAnswers += answerObj.evidence.text + " ";
            }
        }

        // Show hidden options available only after answer displayed
        var disclaimer = $('#bottomDetailsDiv');
        disclaimer.toggleClass("hidden",false);

        // Show JSON Received link
        var jsonReceivedDiv = $('#jsonReceivedFromWatson');
        jsonReceivedDiv.html(JSON.stringify(r, undefined, 2));
        forceAllLinksNewTab(jsonReceivedDiv);

        sendFirstTwoAnswersToDBPedia();
    };

    // If an entity could be extracted from the user's question, then try to
    // find one from the entities in the answers to that question.
    function sendFirstTwoAnswersToDBPedia(question) {

        if (hasDBpediaResponseReturned && !hasDBpediaEntityInfo && firstTwoAnswers) {
            getDBpediaInfo(firstTwoAnswers);
            firstTwoAnswers = null;  // Prevent being called a 2nd time.
        }
    }

    function displayDBpediaResults(response,question) {

        var entities = response["enhanced_entities"];
        hasDBpediaResponseReturned = true;
        hasDBpediaEntityInfo = entities && entities.length > 0;
        if (hasDBpediaEntityInfo) {

            // Thumbnail first as we do get empty entities
            var entity = entities[0];
            var thumbnail = entity['thumbnail'];
            if (thumbnail) {

                console.log("DBpedia found: " + JSON.stringify(response));

                var bottomDetailsDiv = $('#bottomDetailsDiv');
                bottomDetailsDiv.toggleClass("bottomDetailsDivNoDBpedia",false);
                bottomDetailsDiv.toggleClass("bottomDetailsDivHasDBpedia",true);

                var dbPediaDiv = $('#dbPediaDiv');
                dbPediaDiv.toggleClass("dbPediaDivVisible",true);
                dbPediaDiv.toggleClass("dbPediaDivHidden",false);


                // Thumbnail
                var img = $('<img class="dbpediaImage">');
                img.attr('src', thumbnail);
                dbPediaDiv.append(img);

                // Name
                var names = entity['names'];
                var namesArr = names.split(",")
                var nameDiv = $('<div class="dbpediaName"><b>' + namesArr[0] + '</b></div>');
                dbPediaDiv.append(nameDiv);

                // Comment
                var comment = entity['comment'];
                var commentDiv = $('<div class="dbpediaComment">' + comment + '</div>');
                commentDiv.html(comment);
                dbPediaDiv.append(commentDiv);
            }
        }else{
            console.log("No DBpedia information found: '" + question + "'");
            sendFirstTwoAnswersToDBPedia();
        }
    }

    function speak(link) {

        // IE and Safari not supported disabled Speak button
        if ($('body').hasClass('ie') || $('body').hasClass('safari')) {
            alert("Internet Explorer and Safari do not support speech playback. Try Chrome or Firefox.");
            return;
        }


    };

    // Ask a question.
    // Invoke the Node.js REST service. The Node.js
    // service, in turn, invokes the IBM Watson QAAPI
    // and returns to us the QAAPI response
    function ask(question) {

        if (question.length < 10) {
            // Ensure a minimal question is provided.
            alert("A valid question is required.");
            return;
        }else if (question.length > 500) {
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
        infoBubble.toggleClass("hidden",true);

        var questionInput = $("#questionInput");
        questionInput.attr("disabled", "disabled");

        var bottomDetailsDiv = $('#bottomDetailsDiv');
        bottomDetailsDiv.toggleClass("hidden",true);

        // Form a question request to send to the Node.js REST service
        var watsonQuestion = {
            'question' : question.trim()
        };

        // Show actual JSON sent as the app server will add to what we pass.
        var actualJsonSentFromAppServer =  {
            question : {
                evidenceRequest : {
                    items : 5
                },
                formattedAnswer : true,
                questionText : question.trim()
             }
        };
        var jsonSentDiv = $('#jsonSentToWatson');
        jsonSentDiv.html(JSON.stringify(actualJsonSentFromAppServer, undefined, 2));
        forceAllLinksNewTab(jsonSentDiv);

        // Update CSS for 'answers displayed'
        $('#skyline').toggleClass("hidden",true);
        $('#titleSubheading').toggleClass("hidden",true);
        $('#titleSubheading').toggleClass("hidden",true);
        $('#watsonImg').toggleClass("watsonImg",false);
        $('#watsonImg').toggleClass("watsonImgAnswers",true);
        $('#askButtonSpan').toggleClass("hidden",false);
        $('#searchDiv').toggleClass("searchDiv",false);
        $('#questionInput').toggleClass("questionInput",false);
        $('#questionInput').toggleClass("questionInputAnswers",true);

        getDBpediaInfo(question);

        // POST the question request to the Node.js REST service
        var samples = $('.dropDownSampleQuestion');
        $.ajax({
            type : 'POST',
            data : watsonQuestion,
            dataType : "json",
            url : '/question',
            success : function(r, msg) {
                if (r[0] == undefined || r[0].question == undefined) {
                    alert("No answers found for question: " + JSON.stringify(r));
                } else {
                    displayAnswers(r);
                }

                // Enable search and stop the progress indicator
                questionInput.removeAttr("disabled");
                samples.removeAttr("disabled");
                ladda.stop();
                questionInput.removeAttr("disabled");
            },
            error : function(r, msg, e) {
                if (r.responseText) {
                    alert(e+' '+r.responseText);
                } else {
                    alert(e);
                }

                // Enable search and stop progress indicator
                questionInput.removeAttr("disabled");
                samples.removeAttr("disabled");
                ladda.stop();
                questionInput.removeAttr("disabled");
            }
        });
    };

    function getDBpediaInfo(question) {

        // Reste tracking of valid dbpedia responses
        hasDBpediaResponseReturned = false;
        hasDBpediaEntityInfo = false;
        firstTwoAnswers = null;

        // Clear Prior Answers
        var dbPediaDiv = $('#dbPediaDiv');
        dbPediaDiv.empty();
        dbPediaDiv.toggleClass("dbPediaDivVisible",false);
        dbPediaDiv.toggleClass("dbPediaDivHidden",true);

        var bottomDetailsDiv = $('#bottomDetailsDiv');
        bottomDetailsDiv.toggleClass("bottomDetailsDivNoDBpedia",true);
        bottomDetailsDiv.toggleClass("bottomDetailsDivHasDBpedia",false);

        var watsonQuestion = {
            'question' : question.trim()
            //'question' : 'Why are San Francisco summers so cold?'
        };
        //var url = "http://127.0.0.1:9999/enhance";
        var url = "http://dbpedia-enhancer.stage1.mybluemix.net/enhance";
        $.ajax({
            type : 'POST',
            data : watsonQuestion,
            dataType : "json",
            url : url,
            success : function(r, msg) {
                displayDBpediaResults(r,question.trim())
            },
            error : function(r, msg, e) {
                if (r.responseText) {
                    alert(e+' '+r.responseText);
                } else {
                    alert(e);
                }
            }
        });
    }

    function showAnswerJsonReceived(event) {
        var link = $('#jsonReceivedFromWatsonLink')
        var isShowJson = (link.html() == 'Show Response JSON Received');
        link.html(isShowJson ? "Hide Response JSON Received" : "Show Response JSON Received");
        $('#jsonReceivedFromWatson').toggleClass("hidden",!isShowJson);
        if(event.preventDefault){
            event.preventDefault();
        }else{
            event.returnValue = false; // for IE as doesn't support preventDefault;
        }
        return false;
    }

    function showQuestionJsonSent(event) {
        var link = $('#jsonSentToWatsonLink')
        var isShowJson = (link.html() == 'Show Question JSON Sent');
        link.html(isShowJson ? "Hide Question JSON Sent" : "Show Question JSON Sent");
        $('#jsonSentToWatson').toggleClass("hidden",!isShowJson);
        if(event.preventDefault){
            event.preventDefault();
        }else{
            event.returnValue = false; // for IE as doesn't support preventDefault;
        }
        return false;
    }

    var submitComment = function(event) {

        if ($('#commentTextArea').val() === commentPlaceholderText || $('#commentTextArea').val().length < 5) {
            alert("A valid comment must be provided.");
            return;
        }
        $('#commentModal').modal('hide');


        // Create comment JSON to send to the Node.js REST service
        var answerIndex = $("#"+event.target.id).data("answerIndex");
        var answerObj = answerObjects[answerIndex];
        var commentJson = {
            'questionId' : answerObj.questionId,
            'answerIndex' : answerObj.pipelineIndex + "",
            'comment' : $('#commentTextArea').val()
        };

        // POST to the Node.js REST service
        $.ajax({
            type : 'POST',
            data : commentJson,
            dataType : "text",
            url : '/answerComment',
            success : function(r, msg) {
            },
            error : function(r, msg, e) {
                // Display error
                if (r.responseText) {
                    alert(e+' '+r.responseText);
                } else {
                    alert(e);
                }
            }
        });
    };

    var toggleMore = function(event) {

        var answerIndex = $("#"+event.target.id).data("answerIndex");
        var moreLink = $("#moreLink"+answerIndex);
        var isShowMore = (moreLink.html() == 'more...');

        // Update answer text
        var answerTextDiv = $("#answerText"+answerIndex);
        var newAnswerText = isShowMore ? answerTextDiv.data("formattedAnswer") : answerTextDiv.data("shortAnswer");;
        answerTextDiv.html(newAnswerText);

        // Update more/less link
        var newText = isShowMore ? 'less...' : 'more...';
        moreLink.html(newText);

        // Toggle evidence
        $('#evidenceDiv'+answerIndex).toggleClass("hidden",!isShowMore);

        if(event.preventDefault){
            event.preventDefault();
        }else{
            event.returnValue = false; // for IE as doesn't support preventDefault;
        }
        return false;
    };

    var answerFeedback = function(fbValue,event) {

        var answerIndex = $("#"+event.target.id).data("answerIndex");
        var answerText = $("#answerText"+answerIndex).html();
        var answerObj = answerObjects[answerIndex];

        // Create feedback JSON to send to the Node.js REST service
        var feedbackJson = {
            'questionId' : answerObj.questionId,
            'answerIndex' : answerObj.pipelineIndex + "",
            'feedback' : fbValue
        };

        // Gray out unselected image to indicate feedback submitted.  Reset selected
        // image in case user re-selects a different feedback value.
        $('#feedbackYesDiv'+answerIndex).toggleClass("feedbackDivSelected",(fbValue==='1'));
        $('#feedbackNoDiv'+answerIndex).toggleClass("feedbackDivSelected",(fbValue==='-1'));
        $('#feedbackPartialDiv'+answerIndex).toggleClass("feedbackDivSelected",(fbValue==='9'));

        $('#feedbackYesLink'+answerIndex).toggleClass("feedbackLinkSelected",(fbValue==='1'));
        $('#feedbackYesLink'+answerIndex).toggleClass("feedbackLinkUnselected",(fbValue!=='1'));
        $('#feedbackNoLink'+answerIndex).toggleClass("feedbackLinkSelected",(fbValue==='-1'));
        $('#feedbackNoLink'+answerIndex).toggleClass("feedbackLinkUnselected",(fbValue!=='-1'));
        $('#feedbackPartialLink'+answerIndex).toggleClass("feedbackLinkSelected",(fbValue==='9'));
        $('#feedbackPartialLink'+answerIndex).toggleClass("feedbackLinkUnselected",(fbValue!=='9'));

        // POST to the Node.js REST service
        $.ajax({
            type : 'POST',
            data : feedbackJson,
            dataType : "text",
            url : '/answerFeedback',
            success : function(r, msg) {
            },
            error : function(r, msg, e) {
                // Display error
                if (r.responseText) {
                    alert(e+' '+r.responseText);
                } else {
                    alert(e);
                }
            }
        });

        if(event.preventDefault){
            event.preventDefault();
        }else{
            event.returnValue = false; // for IE as doesn't support preventDefault;
        }
        return false;
    };

    function showExampleAnswer(link) {
        $("#questionInput").val($(link).html());
        ask($("#questionInput").val());
    };

    function prepareExampleQuestions() {

        // Create links
        var hiddenQuestionsDiv = $("#hiddenExampleQuestions");
        var exampleQuestions = jQuery.parseJSON(hiddenQuestionsDiv.text());
        maxAvailableExampleCount = exampleQuestions.questions.length;
        for (var i = 0; i < maxAvailableExampleCount;i++) {
            var linkId = EXAMPLE_QUESTION_LINK + i;
            $('#exampleQuestionsDiv').append("<a class='hidden exampleQuestionLink' id='" + linkId + "'>" + exampleQuestions.questions[i].text + "</a>");
            var link = $("#"+linkId);
            link.speed = Math.random()+0.25;
            var alpha = Math.floor(Math.random() * 100);
            var color = '#59bbe5';
            if (alpha < 15) color = '#50b6e1';
            else if (alpha < 30) color = '#47b0dd';
            else if (alpha < 45) color = '#3eacd9';
            else if (alpha < 60) color = '#35a7d6';
            else if (alpha < 75) color = '#2da2d2';
            else if (alpha < 90) color = '#249dcf';
            /*else if (alpha < 70) color = '#1a98cb';
            else if (alpha < 80) color = '#1a98cb';*/
            link.css('color',color);
            link.on('click',function(){
                showExampleAnswer(this)
            });
            hiddenExampleLinks.push(link);
        }

        refreshExampleQuestions(true);
        window.setInterval(function(){
            refreshExampleQuestions(false);
        }, 50);
    }

    function refreshExampleQuestions(isInitialLoading) {

        // Remove all questions that have moved off screen
        for (var i = 0; i < visibleExampleLinks.length;i++) {
            var link = visibleExampleLinks[i];
            if (link.position().left + link.width() < 0) {
                link.toggleClass("hidden",true);
                visibleExampleLinks.splice(visibleExampleLinks.indexOf(link), 1);
                hiddenExampleLinks.push(link);
                i++;
            }
        }

        // Determine max visible questions
        var maxFloatingExamples = $(document).height()/50.0; // Limit to one example per 50px vertical
        if (maxFloatingExamples > maxAvailableExampleCount) {
            maxFloatingExamples = maxAvailableExampleCount;
        }

        // Add new questions
        while (visibleExampleLinks.length < maxFloatingExamples) {
            var link = hiddenExampleLinks.pop();
            visibleExampleLinks.push(link);
            var offsetY = getNonOverlappingOffsetY();
            var offsetX = $(document).width()-link.width()
            if (isInitialLoading) {
                offsetX = Math.floor((Math.random() * offsetX) + 1);
            }
            link.css({  top: offsetY,
                        left: offsetX,
                        position:'absolute'});
            link.toggleClass("hidden",false);
        }

        // Move visible question links
        for (var i = 0; i < visibleExampleLinks.length;i++) {
            var link = visibleExampleLinks[i];
            link.css({  left: link.position().left - link.speed,
                        position:'absolute'});
        }
    };

    // Ensure no example questions will overlap
    function getNonOverlappingOffsetY() {
        var isOverlap = true;
        var offsetY = -1;
        var testCount = 0;
        while (isOverlap) {
            offsetY = Math.floor((Math.random() * ($(document).height()-30)) + 15);
            var passedTest = true;
            for (var i = 0; i < visibleExampleLinks.length;i++) {
                var link = visibleExampleLinks[i];
                if (offsetY >= link.position().top-30 && offsetY < link.position().top+30) {
                    passedTest = false;
                    break;
                }
            }
            isOverlap = !passedTest;
            testCount++;
            if (testCount == 4000) {
                break; // Prevent deadlock which has happened many times.  Probably need better algorithm.
            }
        }
        return offsetY;
    };

    // Initialize the application
    var init = function() {

        // Init question input
        prepareExampleQuestions();

        // Wire the search form to ask a question on submit
        $("#questionForm").submit(function(e) {
            ask($("#questionInput").val());
        });

        // Set correct background image. Wish there was a better way to
        // dynamically apply this!!!
        var isTravelDemoSpan = $(document).find('#isTravelDemo');
        isTravelDemo = isTravelDemoSpan.text() === 'true';
        if (isTravelDemo) {
            //
        }else{
            //
        }

        // Init show json sent/received links
        $(document).on('click', '#jsonSentToWatsonLink', function(event) {
            showQuestionJsonSent(event);
        });
        $(document).on('click', '#jsonReceivedFromWatsonLink', function(event) {
            showAnswerJsonReceived(event);
        });

        //initAudio();
    };

    /*function initAudio() {

        $('.audio').on('error', function () {
            alert('Error processing the audio request.');
        });

        $('.audio').on('loadeddata', function () {
            $('.result').show();
        });

        $('.speak-button').click(function() {
            audio.pause();

            if (validText(textArea.val())) {
                audio.setAttribute('src','/synthesize?' + $('form').serialize());
            }
        });
    }*/

    // UTILITY METHODS
    var forceAllLinksNewTab = function(div) {
        // When displaying formatted text from Watson, ensure all <a> links popup a new window
        // rather than opening in the same window.
        div.find('a').each(function() {
            $(this).attr('target','_blank');
        });
    };


    // Expose privileged methods
    return {
        init : init
    };
}(); // Don't delete the circle brackets...required!

WatsonTravel.App.init();
