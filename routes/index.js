var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {

    exampleQuestions = { questions : []};
    exampleQuestions.questions[0] = { text:"What is the capital of Canada?"};
    exampleQuestions.questions[1] = { text:"Who is Barack Obama's spouse?"};
    exampleQuestions.questions[2] = { text:"How many children does Tom Cruise have?"};
    exampleQuestions.questions[3] = { text:"Who is the Mayor of New York City?"};
    exampleQuestions.questions[4] = { text:"What causes the flu?"};
    exampleQuestions.questions[5] = { text:"When was the Eiffel Tower built?"};
    exampleQuestions.questions[6] = { text:"What is the capital of the state of California?"};
    exampleQuestions.questions[7] = { text:"What was the construction date of the Empire State Building?"};
    exampleQuestions.questions[8] = { text:"How much is Bill Gates worth?"};
    exampleQuestions.questions[9] = { text:"How old is Sylvester Stallone?"};
    exampleQuestions.questions[10] = { text:"When was Arnold Schwarzenegger born?"};
    exampleQuestions.questions[11] = { text:"What is Mark Zuckerberg net worth?"};
    exampleQuestions.questions[12] = { text:"Where did Isaac Newton attend college?"};
    exampleQuestions.questions[13] = { text:"What was Albert Einstein's alma mater?"};
    exampleQuestions.questions[14] = { text:"What is the population of the state of california?"};
    exampleQuestions.questions[15] = { text:"What is the population of the New York City?"};
    exampleQuestions.questions[16] = { text:"What is the area code for Park City, Utah?"};
    exampleQuestions.questions[17] = { text:"Who is the governor of California?"};
    exampleQuestions.questions[18] = { text:"Who is the mayor of San Francisco, California?"};
    exampleQuestions.questions[19] = { text:"What are the symptoms of the common cold?"};
    exampleQuestions.questions[20] = { text:"How many people live in Tokyo, Japan?"};
    exampleQuestions.questions[21] = { text:"What was Leonardo Da Vinci birthdate?"};
    exampleQuestions.questions[22] = { text:"How much is Donald Trump worth?"};
    exampleQuestions.questions[23] = { text:"Where was Tom Cruise born?"};
    exampleQuestions.questions[23] = { text:"What's the elevation of Mt Everest?"};
    exampleQuestions.questions[23] = { text:"How tall is the Eiffel Tower?"};

    res.render('index', {exampleQuestions:JSON.stringify(exampleQuestions) });
});

module.exports = router;
