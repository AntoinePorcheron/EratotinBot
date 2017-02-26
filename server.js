var restify = require('restify');
var builder = require('botbuilder');

var ASK_QUIZZ = "Ecrivez la question, suivi de la réponse, séparé par un point virgule. Example : question;réponse";

var SWEAR_WORD = [
    "connard",
    "fils de pute",
    "salope",
    "leche mes couilles",
    "mange merde",
    "connasse",
    "salaud",
    "petite bite"
]

var SWEAR_RESPONSES = [
    "espèce de raclure de bidet",
    "p'tite bite",
    "sac à foutre",
    "mangeur de zgueg",
    "leche cul",
    "moule à gauffre",
    "ectoplasme",
    "MILLE MILLIONS DE MILLE SABORDS",
    "espèce inférieur",
    "aztèque",
    "babouin",
    "bachi-bouzouk",
    "micro penis",
    "j'baise ta mère",
    "s'pèce de putain",
    "casse toi pauvre con"
]

function parseText(text){
    var reg = new RegExp(/<[^/]+>.+<\/.+>.*/);
    var replace_reg = new RegExp(/<[^/]+>.+<\/.+>/);
    if ( reg.test(text)){
        text = text.replace(replace_reg, "");
    }
    return text.trim();
}

function rand(a, b){
    return Math.round((Math.random() + a) * (b - a));
}

function matchWord(w, t){
    console.log(w, t);
    if (w.length == t.length){
        for (var i = 0; i < w.length; ++i){
            if ((w[i] != t[i].toLowerCase() && w[i] != t[i].toUpperCase())){
                return false;
            }
        }
        return true;
    }else{
        return false;
    }
}

function matchListWord(w, l){
    for (var i = 0; i < l.length; ++i){
        console.log(l[i]);
        if (matchWord(w, l[i])){
            return i;
        }
    }
    return -1;
}

function any(array){
    return array[rand(0, array.length)];
}

class Quizz{
    constructor(q, a){
        this.question = q;
        this.anwser = a;
    }
}

var QUIZZY = [new Quizz("qu'est-ce qui est plus chaud que le mont vesuve?", "ta mère!")];

var server = restify.createServer();

server.listen(process.env.port || process.env.PORT || 80, function () {});
  
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());


bot.dialog('/', function (session) {
    
    var input = parseText(session.message.text);

    if (matchListWord(input, SWEAR_WORD) > -1){
        session.beginDialog("/swear");
    }else if (input.startsWith("quizz"/* add"*/)){
        session.beginDialog("/" + input.replace(" ", "-"));
        /*session.beginDialog("/quizz-add");
    }else if (input === "quizz show"){
        session.beginDialog("/quizz-show");
    }*/

});

bot.dialog('/swear', function(session){
    session.send(any(SWEAR_RESPONSES));
    session.endDialog();
});

bot.dialog('/quizz-show', function(session){
    for (var i = 0; i < QUIZZY.length; ++i){
        session.send(QUIZZY[i].question);
    }
});

bot.dialog('/quizz-add', [
    function(session){
        builder.Prompts.text(session, ASK_QUIZZ);
    },
    function(session, result){
        var tmp = result.response.split(";");
        QUIZZY.push(new Quizz(tmp[0], tmp[1]));
        session.send("Merci de votre participation!");
        session.endDialog();
    }
]);

bot.dialog('/quizz-start', function(session){
    
});

bot.dialog('/quizz-question', [
    function(session){

    },

    function(session, response){

    }
]);
