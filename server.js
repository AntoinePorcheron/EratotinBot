var restify = require('restify');
var builder = require('botbuilder');


var server = restify.createServer();

/*console.log(process.env.PORT)
console.log(*/
server.listen(/*process.env.port || process.env.PORT || 3978*/80, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
var connector = new builder.ChatConnector({
    appId: /*process.env.MICROSOFT_APP_ID*/5fab6329-744a-45ad-9259-3767e61a39d1,
    appPassword: /*process.env.MICROSOFT_APP_PASSWORD*/8orDy9Xsc0O2mHY0jTkhVmH
});

var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());


bot.dialog('/', function (session) {
    session.send("Hello World");
});
