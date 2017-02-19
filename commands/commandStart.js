const moment = require('moment');
const helpers = require('../helpers.js');

const commandStart = (Time, message, slashCommand) => {

    // Checking if start time for current day already exists
    Time.find({
        time: {
            '$gte': helpers.limitsOfToday().todayStart,
            '$lte': helpers.limitsOfToday().todayEnd
        },
        type: 'start',
        userId: message.user_id
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
            const timeStart = moment();

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
                        'Started working time: *' + moment(timeStart)
                            .format('dddd, DD.MM.YYYY [at] HH:mm') + '*.\n' +
                        'Time to get work done, we need to make some money.'
                    );
                }
            });
        }
    });
};

module.exports = commandStart;
