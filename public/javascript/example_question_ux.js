
//************ Constructor **************//
function ExampleQuestionUX(askFunction) {

    this.askFunction = askFunction;
    this.visibleExampleLinks = [];
    this.hiddenExampleLinks = [];

    // Init question input
    this.prepareExampleQuestions();
}

ExampleQuestionUX.prototype.prepareExampleQuestions = function() {

    this.exampleQuestionsJson = jQuery.parseJSON($("#hiddenExampleQuestions").text());

    // Create links
    var internalThis = this;
    for (var i = 0; i < this.exampleQuestionsJson.questions.length;i++) {
        var linkId = "example_question_link_" + i;
        $('#exampleQuestionsDiv').append("<a class='hidden exampleQuestionLink' id='" + linkId + "'>" + this.exampleQuestionsJson.questions[i].text + "</a>");
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
        link.on('click',function(sender){
            $("#questionInput").val($("#" + sender.currentTarget.id).html());
            internalThis.askFunction($("#questionInput").val());
        });
        this.hiddenExampleLinks.push(link);
    }

    this.refreshExampleQuestions(true);
    window.setInterval(function(){
        internalThis.refreshExampleQuestions(false);
    }, 50);
}

ExampleQuestionUX.prototype.refreshExampleQuestions = function(isInitialLoading) {

    // Remove all questions that have moved off screen
    for (var i = 0; i < this.visibleExampleLinks.length;i++) {
        var link = this.visibleExampleLinks[i];
        if (link.position().left + link.width() < 0) {
            link.toggleClass("hidden",true);
            this.visibleExampleLinks.splice(this.visibleExampleLinks.indexOf(link), 1);
            this.hiddenExampleLinks.push(link);
            i++;
        }
    }

    // Determine max visible questions
    var maxFloatingExamples = $(document).height()/50.0; // Limit to one example per 50px vertical
    if (maxFloatingExamples > this.exampleQuestionsJson.questions.length) {
        maxFloatingExamples = this.exampleQuestionsJson.questions.length;
    }

    // Add new questions
    while (this.visibleExampleLinks.length < maxFloatingExamples) {
        var link = this.hiddenExampleLinks.pop();
        this.visibleExampleLinks.push(link);
        var offsetY = this.getNonOverlappingOffsetY();
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
    for (var i = 0; i < this.visibleExampleLinks.length;i++) {
        var link = this.visibleExampleLinks[i];
        link.css({  left: link.position().left - link.speed,
            position:'absolute'});
    }
};

// Ensure no example questions will overlap
ExampleQuestionUX.prototype.getNonOverlappingOffsetY = function(isInitialLoading) {

    var isOverlap = true;
    var offsetY = -1;
    var testCount = 0;
    while (isOverlap) {
        offsetY = Math.floor((Math.random() * ($(document).height()-30)) + 15);
        var passedTest = true;
        for (var i = 0; i < this.visibleExampleLinks.length;i++) {
            var link = this.visibleExampleLinks[i];
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
}




