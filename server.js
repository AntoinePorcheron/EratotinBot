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
    "petite bite",
    "abruti",
    "bite",
    "pute",
    "putain",
    "leche cul",
    
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

var SALUTATION_WORD = [
    "salut",
    "bonjour",
    "coucou",
    "yo",
    "yop"
]

var RANDOM_PHRASE = [
    "Plait-il?!",
    "C'est une menaçe?",
    "tu veut du pain?",
    "je sais pas quoi dire...",
    "Mais... mais... je te permet pas!",
    "Votre échantillon a été traité ; nous pouvons maintenant procéder aux tests.",
    "J'attire votre attention sur le champ de particules incandescentes situé devant la sortie.",
    "Veillez à ne pas sortir cet appareil de la zone de tests.",
    "Nous apprécions votre diligence !",
    "Vous vous en sortez bien.",
    "J'insiste, très beau travail.",
    "Faites attention.",
    "Il est inutile d'essayer.",
    "Le centre d'enrichissement tient à renouveler ses excuses suite au problème occasionné par un environnement de test insoluble.",
    "Dans le cadre d'un protocole de test facultatif, nous avons ajouté une situation cocasse",
    "Vous m'écoutez toujours ?",
    "Vous êtes toujours là ?",
    "Vous êtes toujours là ?",
    "Ça suffit, n'y touchez pas.",
    "N'y- tou-chez- pas.",
    "Effectivement..."
]

var CURRENT_QUESTION = null;

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
        if (matchWord(w, l[i])){
            return i;
        }
    }
    return -1;
}

function any(array){
    var pos = rand(0, array.length - 1);
    console.log(pos);
    return array[pos];
}

class Quizz{
    constructor(q, a){
        this.question = q;
        this.anwser = a;
    }
}

class QuizzList{
    constructor(list){
        this.quizzes = list;
        this.current = rand(0, this.quizzes.length - 1);
    }

    next(){
        this.current = rand(0, this.quizzes.length - 1);
    }

    current(){
        return this.quizzes[this.current]
    }
}

class Player{
    constructor(name){
        this.name = name;
        this.score = 0;
    }
}

class BotState{
    constructor(bot){
        this.bot = bot;
    }
}

class BotStateQuizz extends BotState{
    constructor(bot){
        super(bot);
        this.currentQuestion = any(QUIZZY);
    }

}

class BotStateDefault extends BotState{

}

class Bot extends builder.UniversalBot{
    constructor(connector){
        super(connector);
        this.state = new BotStateDefault(this);
    }
}


var QUIZZY = [new Quizz("qu'est-ce qui est plus chaud que le mont vesuve?", "ta mère!")];

var server = restify.createServer();

server.listen(process.env.port || process.env.PORT || 80, function () {});
  
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var bot = new /*builder.UniversalBot*/Bot(connector);
server.post('/api/messages', connector.listen());


bot.dialog('/', function (session) {
    
    var input = parseText(session.message.text);

    if (matchListWord(input, SWEAR_WORD) > -1){
        session.beginDialog("/swear");
    }else if (input.startsWith("quizz")){
        session.beginDialog("/" + input.replace(" ", "-"));
        //should test if he's allowed to do this...
    }else{
        session.beginDialog("/global");
    }
});

bot.dialog('/swear', function(session){
    session.send(any(SWEAR_RESPONSES));
    session.endDialog();
});

bot.dialog('/quizz-show', function(session){
    for (var i = 0; i < QUIZZY.length; ++i){
        session.send(QUIZZY[i].question);
    }
    session.endDialog();
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
    session.send("Attention mesdames et messieurs, nous voila parti pour une folle session de 10 question! À vos jeux!");
    CURRENT_QUESTION = any(QUIZZY);
    session.send("Demarrage de la partie dans 5 secondes...");
    setTimeout(function(){session.beginDialog("/quizz-question")}, 5000);
});

bot.dialog('/quizz-question', [
    function(session){
        console.log("start");
        builder.Prompts.text(session, CURRENT_QUESTION.question);
    },
    
    function(session, result){
        if (parseText(result.response) === CURRENT_QUESTION.anwser){
            session.send("Bravo! la réponse était : ")
            session.send(CURRENT_QUESTION.anwser);
            session.endDialog(); 
        }
    }
]);


bot.dialog('/global', function(session){
    session.send(any(RANDOM_PHRASE));
    session.endDialog();              
});
