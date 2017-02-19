const moment = require('moment');
const helpers = require('../helpers.js');

const commandEnd = (Time, message, slashCommand) => {

    // Checking if end time for current day already exists
    Time.find({
        time: {
            '$gte': helpers.limitsOfToday().todayStart,
            '$lte': helpers.limitsOfToday().todayEnd
        },
        type: 'end',
        userId: message.user_id
    }).exec(function(err, times) {
        if (err) {
            // TODO: output proper error
            console.log('I got some error!');
        }

        // Refusing inserting time ended
        else if (times.length) {
            slashCommand.replyPublic(message,
                'This is odd, haven\'t you already ended your work today?'
            );
        }

        // Ending procedure
        else {
            Time.find({userId: message.user_id})
                .sort({_id: -1}).limit(1)
                .exec(function (err, times) {
                    if (err) {
                        // TODO: output proper error
                        console.log('I got error!');
                    }
                    else {
                        const timeStart = times[0].time,
                              timeNow = new Date();

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
                                    'Ended working time: *' + moment(timeNow)
                                        .format('dddd, DD.MM.YYYY [at] HH:mm') + '*.\n' +
                                    'Total time: *' + helpers.timeDuration(timeStart, timeNow) + '*.\n' +
                                    'Well, tomorrow is another day. Good job!'
                                );
                            }
                        });
                    }
                });
        }
    });
};

module.exports = commandEnd;
