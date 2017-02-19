const moment = require('moment');

const commandList = (Time, message, slashCommand) => {
    Time.find({ userId: message.user_id })
        .sort({ time: 1 })
        .exec((err, times) => {
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

                times.forEach(time => {
                    output += mapper[time.type] + ' ' +
                        moment(time.time).format('ddd, DD.MM.YY, HH:mm') + ' | ' +
                        time._id + ' ' + '\n';

                });

                output += '```';

                slashCommand.replyPublic(message, output);
            }
        });
};

module.exports = commandList;
