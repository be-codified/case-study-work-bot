const Botkit = require('botkit');
const mongoose = require('mongoose');
const moment = require('moment');
require('moment-duration-format');

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
        const timeNow = new Date();
        var timeStart;

        // Command `start`
        if (message.text === 'start') {
            timeStart = moment();

            // Checking if start time for current day already exists
            var todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            var todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            Time.find({
                type: 'start',
                time: {
                    '$gte': todayStart,
                    '$lte': todayEnd
                }
            }).exec(function(err, times) {
                if (err) {
                    // TODO: output proper error
                    console.log('I got some error!');
                }
                // Refusing inserting time started
                else if (times.length) {
                    slashCommand.replyPublic(message,
                        'This is odd, haven\'t you already started to work today?'
                    );
                }
                // Inserting time started
                else {
                    Time.create({
                        time: timeStart, // NOTE: date will be written as ISO format in database
                        type: 'start',
                        userId: message.user_id
                    }, function(err, time) {
                        if (err) {
                            // TODO: output proper error
                            console.log('I got some error!');
                        }
                        else {
                            slashCommand.replyPublic(message,
                                'Started working time: *' + moment(timeStart).format('dddd, DD.MM.YYYY [at] HH:mm') + '*.\n' +
                                'Time to get work done, we need to make some money.'
                            );
                        }
                    });
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
                        const timeStart = times[0].time;

                        // TODO: output proper message if more than 8 hours have passed by
                        slashCommand.replyPublic(message,
                            'Remaining working time: *' + helpers.timeRemain(timeStart, timeNow) + '*.\n' +
                            'Oh, the time flies so fast.'
                        );
                    }
            });
        }

        // Command `end`
        else if (message.text === 'end') {
            Time.find({userId: message.user_id})
                .sort({_id: -1}).limit(1)
                .exec(function (err, times) {
                    if (err) {
                        // TODO: output proper error
                        console.log('I got some error!');
                    }
                    else {
                        const timeStart = times[0].time;

                        Time.create({
                            time: timeNow, // NOTE: date will be written as ISO format in database
                            type: 'end',
                            userId: message.user_id
                        }, function (err, time) {
                            if (err) {
                                // TODO: output proper error
                                console.log('I got some error!');
                            }
                            else {
                                slashCommand.replyPublic(message,
                                    'Ended working time: *' + moment(timeNow).format('dddd, DD.MM.YYYY [at] HH:mm') + '*.\n' +
                                    'Total time: *' + helpers.timeDuration(timeStart, timeNow) + '*.\n' +
                                    'Well, tomorrow is another day. Good job!'
                                );
                            }
                        });
                    }
                });
        }

        // Command `list`
        else if (message.text === 'list') {
            Time.find({ userId: message.user_id })
                .sort({ time: 1 })
                .exec(function(err, times) {
                    if (err) {
                        // TODO: output proper error
                        console.log('I got some error!');
                    }
                    else {
                        const mapper = {
                            start: 'Start:',
                            end: 'End:  '
                        };

                        var output = 'Listing all recorded times\n\n';
                            output += '```';

                        times.forEach(function(time) {
                            output += mapper[time.type] + ' ' +
                                      moment(time.time).format('ddd, DD.MM.YY, HH:mm') + ' | ' +
                                      time._id + ' ' + '\n';

                        });

                        output += '```';

                        slashCommand.replyPublic(message, output);
                    }
                });
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
