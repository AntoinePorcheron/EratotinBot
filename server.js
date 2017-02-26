var restify = require('restify');
var builder = require('botbuilder');

var SWEAR_WORD = [
    "connard",
    "fils de pute",
    "salope",
    "leche mes couilles",
    "mange merde",
    "connasse",
    "salaud"
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
    "s'pèce de putain"
]

function rand(a, b){
    return Math.round((Math.rand() + a) * (b - a));
}

function matchWord(w, t){
    console.log(w, t);
    if (w.length == t.length){
        for (var i = 0; i < w.length; ++i){
            if (! (w[i] == t[i].toLowerCase() && w[i] == t[i].toUpperCase())){
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

server.listen(process.env.port || process.env.PORT || 80, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());


bot.dialog('/', function (session) {

    if (matchListWord(session.text, SWEAR_WORD) > 0){
        session.send(any(SWEAR_RESPONSES));
    }
    console.log(session);
});
