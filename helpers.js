const moment = require('moment');

/** TimeRemain
 *
 * @param {object} timeStart - Date/time of start time.
 * @param {object} timeNow - Date/time of now.
 *
 * @return {string} Time remaining in HH:mm format.
 *
 */

const timeRemain = (timeStart, timeNow) => {
    const timeMandatory = 8 * 60 * 60; // 8 hours in seconds

    // NOTE: unix time returns seconds, duration expects milliseconds
    return moment.duration((moment(timeStart).unix() + timeMandatory - moment(timeNow).unix()) * 1000).format('HH:mm');
};

/** TimeDuration
 *
 * @param {object} timeStart - Date/time of start time.
 * @param {object} timeNow - Date/time of now.
 *
 * @return {string} Time duration in HH:mm format.
 *
 */

const timeDuration = (timeStart, timeNow) => {

    // NOTE: unix time returns seconds, duration expects milliseconds
    return moment.duration((timeNow.unix() - timeStart.unix()) * 1000).format('HH:mm');
};

module.exports = { timeRemain, timeDuration };