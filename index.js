const Botkit = require('botkit');
const mongoose = require('mongoose');
const moment = require('moment');
require('moment-duration-format');

const commandStart = require('./commands/commandStart.js');
const commandStatus = require('./commands/commandStatus.js');
const commandEnd = require('./commands/commandEnd.js');
const commandList = require('./commands/commandList.js');
const helpers = require('./helpers.js');

/**
 * Botkit config
 */

if (!process.env.CLIENT_ID ||
    !process.env.CLIENT_SECRET ||
    !process.env.PORT ||
    !process.env.VERIFICATION_TOKEN) {
        console.log('Error: Specify CLIENT_ID, CLIENT_SECRET, VERIFICATION_TOKEN and PORT in environment');
        process.exit(1);
}

var config = {};

if (process.env.MONGOLAB_URI) {
    const BotkitStorage = require('botkit-storage-mongo');
    config = {
        storage: BotkitStorage({ mongoUri: process.env.MONGOLAB_URI })
    };
}
else {
    config = {
        json_file_store: './db_slackbutton_slash_command/'
    };
}

const controller = Botkit.slackbot(config).configureSlackApp(
    {
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        scopes: ['commands']
    }
);

/**
 * Mongo config
 */

mongoose.connect('mongodb://localhost/test');

const TimeSchema = new mongoose.Schema({
    time: Date,
    type: String,
    userId: String
});

const Time = mongoose.model('Time', TimeSchema);

/**
 * Login
 */

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

/**
 * Commands
 */

controller.on('slash_command', function (slashCommand, message) {

    // Check token match
    if (message.token !== process.env.VERIFICATION_TOKEN) {
        return false;
    }

    // Check for `work` command
    if (message.command === '/devworkbot' || message.command === '/workbot') {
        var timeStart;

        // Command `start`
        if (message.text === 'start') {
            commandStart(Time, message, slashCommand);
        }

        // Command `status`
        else if (message.text === 'status') {
            commandStatus(Time, message, slashCommand);
        }

        // Command `end`
        else if (message.text === 'end') {
            commandEnd(Time, message, slashCommand);
        }

        // Command `list`
        else if (message.text === 'list') {
            commandList(Time, message, slashCommand);
        }

        // Command `help`
        else if (message.text === 'help') {
            slashCommand.replyPublic(message,
                'Here are commands you can use:\n\n' +
                '`/workbot start` sets start of working time.\n' +
                '`/workbot status` shows remaining working time.\n' +
                '`/workbot end` sets end of working time.\n' +
                '`/workbot list` shows all working times.'
            );
        }

        else {
            slashCommand.replyPublic(message,
                'I\'m afraid I don\'t know how to ' + message.command + ' yet.'
            );
        }

    }
});
