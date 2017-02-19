const helpers = require('../helpers.js');

const commandDelete = (Time, message, slashCommand) => {

    // TODO: implementation

    slashCommand.replyPublic(message,
        'Deleting...'
    );

    /*
     const timeNow = new Date();


    Time.find({ userId: message.user_id })
        .sort({ _id: -1 }).limit(1)
        .exec((err, times) => {
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
        */
};

module.exports = commandDelete;