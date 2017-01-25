var Botkit = require('botkit');

// config

if (!process.env.CLIENT_ID ||
    !process.env.CLIENT_SECRET ||
    !process.env.PORT ||
    !process.env.VERIFICATION_TOKEN) {
        console.log('Error: Specify CLIENT_ID, CLIENT_SECRET, VERIFICATION_TOKEN and PORT in environment');
        process.exit(1);
}

var config = {};

if (process.env.MONGOLAB_URI) {
    var BotkitStorage = require('botkit-storage-mongo');
    config = {
        storage: BotkitStorage({ mongoUri: process.env.MONGOLAB_URI })
    };
}
else {
    config = {
        json_file_store: './db_slackbutton_slash_command/'
    };
}

var controller = Botkit.slackbot(config).configureSlackApp(
    {
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        scopes: ['commands']
    }
);

// login

controller.setupWebserver(process.env.PORT, function (err, webserver) {
    controller.createWebhookEndpoints(controller.webserver);

    controller.createOauthEndpoints(controller.webserver, function (err, req, res) {
        if (err) {
            res.status(500).send('ERROR: ' + err);
        }
        else {
            res.send('Success!');
        }
    });
});

// commands

controller.on('slash_command', function (slashCommand, message) {

    // check token match
    if (message.token !== process.env.VERIFICATION_TOKEN) {
        return false;
    }

    // check for `work` command
    if (message.command === '/work') {

        /*
         // If we made it here, just echo what the user typed back at them
         //TODO You do it!
         slashCommand.replyPublic(message, "1", function () {
         slashCommand.replyPublicDelayed(message, "2").then(slashCommand.replyPublicDelayed(message, "3"));
         });
         */

        if (message.text === 'start') {
            slashCommand.replyPublic(message,
                'Started working time: tuesday, **6.5.2017** at **7:45**.\n' +
                'Time to get work done, we need to make some money.'
            );
        }
        else if (message.text === 'status') {
            slashCommand.replyPublic(message,
                'Remaining working time: **1:45**.\n' +
                'Oh, the time flies so fast.'
            );
        }
        else if (message.text === 'end') {
            slashCommand.replyPublic(message,
                'Ended working time: tuesday, **6.5.2017** at **15:45**.\n' +
                'Well, tomorrow is another day. Good job!'
            );
        }
        else {
            slashCommand.replyPublic(message,
                'I\'m afraid I don\'t know how to ' + message.command + ' yet.'
            );
        }
    }
});

