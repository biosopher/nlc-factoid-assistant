var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {

    exampleQuestions = { questions : []};
    exampleQuestions.questions[0] = { text:"What is the capital of Canada?"};
    exampleQuestions.questions[1] = { text:"Who is Barack Obama's spouse?"};
    exampleQuestions.questions[2] = { text:"How many children does Tom Cruise have?"};
    exampleQuestions.questions[3] = { text:"Who is the Mayor of New York City?"};
    exampleQuestions.questions[4] = { text:"How deep is the Grand Canyon?"};
    exampleQuestions.questions[5] = { text:"How high is the Eiffel Tower?"};
    exampleQuestions.questions[6] = { text:"?"};
    exampleQuestions.questions[7] = { text:"What's the height of Mount Everest?"};
    exampleQuestions.questions[8] = { text:"How much is Donald Trump worth?"};
    exampleQuestions.questions[9] = { text:"How old is Sylvester Stallone?"};
    exampleQuestions.questions[10] = { text:"How tall is Tom Cruise?"};
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

    res.render('index', {exampleQuestions:JSON.stringify(exampleQuestions) });
});

module.exports = router;
