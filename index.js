var Botkit = require('botkit');
var mongoose = require('mongoose');
var moment = require('moment');
require('moment-duration-format');

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

/**
 * Mongo config
 */

mongoose.connect('mongodb://localhost/test');

var TimeSchema = new mongoose.Schema({
    time: Date,
    type: String,
    userId: String
});

var Time = mongoose.model('Time', TimeSchema);

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
 * Helpers
 */

/** Helper timeRemain
 *
 * @param {object} timeStart - Date/time of start time.
 * @param {object} timeNow - Date/time of now.
 *
 * @return {string} Time remaining in HH:mm format.
 *
 */

var timeRemain = function(timeStart, timeNow) {
    var timeMandatory = 8 * 60 * 60; // 8 hours in seconds

    // NOTE: unix time returns seconds, duration expects milliseconds
    return moment.duration((moment(timeStart).unix() + timeMandatory - moment(timeNow).unix()) * 1000).format('HH:mm');
};

/** Helper timeDuration
 *
 * @param {object} timeStart - Date/time of start time.
 * @param {object} timeNow - Date/time of now.
 *
 * @return {string} Time duration in HH:mm format.
 *
 */

var timeDuration = function(timeStart, timeNow) {

    // NOTE: unix time returns seconds, duration expects milliseconds
    return moment.duration((timeNow.unix() - timeStart.unix()) * 1000).format('HH:mm');
};

/**
 * Commands
 */

controller.on('slash_command', function (slashCommand, message) {

    // Check token match
    if (message.token !== process.env.VERIFICATION_TOKEN) {
        return false;
    }

    // Check for `work` command
    if (message.command === '/work') {
        var timeStart,
            timeNow = new Date();

        // Command `start`
        if (message.text === 'start') {
            timeStart = moment();

            Time.create({
                time: timeStart, // NOTE: date will be written as ISO format in database
                type: 'start',
                userId: message.user_id
            }, function(err, time) {
                if (err) {
                    console.log(err)
                }
                else {
                    slashCommand.replyPublic(message,
                        'Started working time: *' + moment(timeStart).format('dddd, DD.MM.YYYY [at] HH:mm') + '*.\n' +
                        'Time to get work done, we need to make some money.'
                    );
                }
            });
        }

        // Command `status`
        else if (message.text === 'status') {
            Time.find({ userId: message.user_id })
                .sort({ _id: -1 }).limit(1)
                .exec(function(err, times) {
                    if (err) {
                        // TODO: output proper error
                        console.log('I got some error!');
                    }
                    else {
                        console.log(times);
                        timeStart = times[0].time;

                        // TODO: output proper message if more than 8 hours have passed by
                        slashCommand.replyPublic(message,
                            'Remaining working time: *' + timeRemain(timeStart, timeNow) + '*.\n' +
                            'Oh, the time flies so fast.'
                        );
                    }
            });
        }

        // Command `end`
        else if (message.text === 'end') {
            timeStart = moment('2017-01-29T11:45:00Z');

            slashCommand.replyPublic(message,
                'Ended working time: *' + timeNow.format('dddd, DD.MM.YYYY [at] HH:mm') + '*.\n' +
                'Total time: *' + timeDuration(timeStart, timeNow) + '*.\n' +
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
