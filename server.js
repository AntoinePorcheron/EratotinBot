//What to do :
// - change method 'input' parameters. It should take the whole message, to be able to respond directly
// - create a swear generator
// - create a swear understander
// - imagine new game
// - a memory system (db, or file maybe?)


const DEFAULT = 0;
const QUIZZ = 1;

let restify = require('restify');
let builder = require('botbuilder');

const ASK_QUIZZ = "Ecrivez la question, suivi de la réponse, séparé par un point virgule. Example : question;réponse";

const SWEAR_WORD = [
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

];

const SWEAR_RESPONSES = [
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
];

const RANDOM_PHRASE = [
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
];

let CURRENT_QUESTION = null;

function parseText(text){
    const reg = new RegExp(/<[^/]+>.+<\/.+>.*/);
    const replace_reg = new RegExp(/<[^/]+>.+<\/.+>/);
    if (reg.test(text)){
        text = text.replace(replace_reg, "");
    }
    return text.trim();
}

function rand(a, b){
    return Math.round((Math.random() + a) * (b - a));
}

function matchWord(w, t){
    if (w.length == t.length){
        for (let i = 0; i < w.length; ++i){
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
    for (let i = 0; i < l.length; ++i){
        if (matchWord(w, l[i])){
            return i;
        }
    }
    return -1;
}

function matchSentence(s1, s2){
    s1 = s1.trim().split(" ");
    s2 = s2.trim().split(" ");
    if (s1.length == s2.length){
        for (let i = 0; i < s1.length; ++i){
            if (!matchWord(s1[i], s2[i])){
                return false;
            }
        }
        return true;
    }else{
        return false;
    }
}

function any(array){
    const pos = rand(0, array.length - 1);
    console.log(pos);
    return array[pos];
}

class Quizz{
    constructor(q, a){
        this.question = q;
        this.anwser = a;
    }
}

let QUIZZY = [new Quizz("qu'est-ce qui est plus chaud que le mont vesuve?", "ta mère!")];
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 80, function () {});
let connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

let bot = new builder.UniversalBot();
server.post('/api/messages', connector.listen());

let mode = DEFAULT;

bot.dialog('/', function (session) {

    if (mode == DEFAULT) {
        let input = parseText(session.message.text);
        if (matchListWord(input, SWEAR_WORD) > -1) {
            session.beginDialog("/swear");
        } else if (input.startsWith("quizz")) {
            session.beginDialog("/" + input.replace(" ", "-"));
            //should test if he's allowed to do this...
        } else {
            session.beginDialog("/global");
        }
    }else if (mode == QUIZZ){

    }
});

bot.dialog('/swear', function(session){
    session.send(any(SWEAR_RESPONSES));
    session.endDialog();
});

bot.dialog('/quizz-show', function(session){
    for (let i = 0; i < QUIZZY.length; ++i){
        session.send(QUIZZY[i].question);
    }
    session.endDialog();
});

bot.dialog('/quizz-add', [
    function(session){
        builder.Prompts.text(session, ASK_QUIZZ);
    },
    function(session, result){
        let tmp = result.response.split(";");
        QUIZZY.push(new Quizz(tmp[0], tmp[1]));
        session.send("Merci de votre participation!");
        session.endDialog();
    }
]);


bot.dialog('/quizz-start', function(session){
    session.send("Attention mesdames et messieurs, nous voila parti pour une folle session de 10 question! À vos jeux!");
    CURRENT_QUESTION = any(QUIZZY);
    session.send("Demarrage de la partie dans 5 secondes...");
    setTimeout(function(){
        mode = QUIZZ;
        session.endDialog()
    }, 5000);
});

bot.dialog('/quizz-question', [
    function(session){
        console.log("start");
        builder.Prompts.text(session, CURRENT_QUESTION.question);
    },
    
    function(session, result){
        if (parseText(result.response) === CURRENT_QUESTION.anwser){
            session.send("Bravo! la réponse était : ");
            session.send(CURRENT_QUESTION.anwser);
            session.endDialog(); 
        }
    }
]);


bot.dialog('/global', function(session){
    session.send(any(RANDOM_PHRASE));
    session.endDialog();              
});
