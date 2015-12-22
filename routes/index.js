var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {

    var isTravelDemo, demoName, backgroundImgCssClass, subheading, sampleQuestion;
    if (req.config.isTravelDemo) {
        isTravelDemo = 'true';
        demoName = "Travel";
        subheading = "How can we help with your travel?";
        exampleQuestions = { questions : []};
        exampleQuestions.questions[0] = { text:"Do I need a visa to enter Brazil?"};
        exampleQuestions.questions[1] = { text:"How much should I tip a taxi in Argentina?"};
        exampleQuestions.questions[2] = { text:"Where is the best place to dive in Australia?"};
        exampleQuestions.questions[3] = { text:"What causes the monsoon season in India?"};
        exampleQuestions.questions[4] = { text:"How deep is the Grand Canyon?"};
        exampleQuestions.questions[5] = { text:"When is the rainy season in Brazil?"};
        exampleQuestions.questions[6] = { text:"Is the water safe to drink in Morocco?"};
        exampleQuestions.questions[7] = { text:"Can adults stay at youth hostels in the United States?"};
        exampleQuestions.questions[8] = { text:"Why are San Francisco summers so cold?"};
        exampleQuestions.questions[9] = { text:"Why is New York City called The Big Apple?"};
        exampleQuestions.questions[10] = { text:"Are permits required to hike the Appalachian Trail?"};
        exampleQuestions.questions[11] = { text:"Where should I dive in the Florida Keys?"};
        exampleQuestions.questions[12] = { text:"Why is Yellowstone National Park yellow?"};
        exampleQuestions.questions[13] = { text:"Why is Los Angeles called 'The City of Angels'?"};
        exampleQuestions.questions[14] = { text:"Do US citizens need a passport to visit Canada?"};
        exampleQuestions.questions[15] = { text:"What castles were built in the United States?"};
        exampleQuestions.questions[16] = { text:"Where is the rain forest in Washington state?"};
        exampleQuestions.questions[17] = { text:"How tall is Mount Everest?"};
        exampleQuestions.questions[18] = { text:"What's the tallest mountain on the West Coast of the U.S.?"};
        exampleQuestions.questions[19] = { text:"Is it safe to visit the pyramids in Giza?"};
        exampleQuestions.questions[20] = { text:"How should I travel from Paris to London?"};
        exampleQuestions.questions[21] = { text:"Which museums should I visit in Paris?"};
        exampleQuestions.questions[22] = { text:"How do I get a tour of Parliament in London?"};
        exampleQuestions.questions[23] = { text:"Can I go on a tour of the Vatican?"};
        exampleQuestions.questions[24] = { text:"How long does it take to go through the Panama Canal?"};
        exampleQuestions.questions[25] = { text:"Can I see the Northern Lights from Alaska?"};
    }else{
        isTravelDemo = 'false';
        demoName = "Healthcare";
        subheading = "How can we help with your health?";
        exampleQuestions = { questions : []};
        exampleQuestions.questions[0] = { text:"What are symptoms of the flu?"};
        exampleQuestions.questions[1] = { text:"Why should I quit smoking?"};
        exampleQuestions.questions[2] = { text:"Where are my tonsils located?"};
        exampleQuestions.questions[3] = { text:"What does my appendix do?"};
        exampleQuestions.questions[4] = { text:"Do I really only use 10% of my brain?"};
        exampleQuestions.questions[5] = { text:"What causes a fever?"};
        exampleQuestions.questions[6] = { text:"What's the difference between a virus and bacteria"};
        exampleQuestions.questions[7] = { text:"Why should I use a broad spectrum sunscreen?"};
        exampleQuestions.questions[8] = { text:"What are the signs of a stroke?"};
        exampleQuestions.questions[9] = { text:"What are the signs of a heart attack?"};
        exampleQuestions.questions[10] = { text:"Where is my amygdala?"};
        exampleQuestions.questions[11] = { text:"What is an MRI?"};
        exampleQuestions.questions[12] = { text:"What is a CAT scan?"};
        exampleQuestions.questions[13] = { text:"How should I treat a migraine?"};
        exampleQuestions.questions[14] = { text:"Why does caffeine help with migraine pain?"};
        exampleQuestions.questions[15] = { text:"Does high cholesterol contribute to heart disease?"};
        exampleQuestions.questions[16] = { text:"What's the difference between high and low cholesterol"};
        exampleQuestions.questions[17] = { text:"What causes an allergic reaction?"};
        exampleQuestions.questions[18] = { text:"What happens during anaphylactic shock?"};
        exampleQuestions.questions[19] = { text:"How can I determine what I'm allergic to?"};
        exampleQuestions.questions[20] = { text:"What's the difference between a tension and stress headache?"};
        exampleQuestions.questions[21] = { text:"Why do my legs hurt two days after I go running?"};
        exampleQuestions.questions[22] = { text:"Why does lactic acid build up in muscles?"};
        exampleQuestions.questions[23] = { text:"What is a neurotransmitter?"};
        exampleQuestions.questions[24] = { text:"How many neurons are in the brain?"};
        exampleQuestions.questions[25] = { text:"What is white and gray matter in the brain?"};
    }
    res.render('index', {   isTravelDemo:isTravelDemo,
                            demoName:demoName,
                            backgroundImgCssClass:backgroundImgCssClass,
                            subheading:subheading,
                            exampleQuestions:JSON.stringify(exampleQuestions) });
});

module.exports = router;
