const moment = require('moment');

/** Time remain
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

/** Time duration
 *
 * @param {object} timeStart - Date/time of start time.
 * @param {object} timeNow - Date/time of now.
 *
 * @return {string} Time duration in HH:mm format.
 *
 */

const timeDuration = (timeStart, timeNow) => {

    // NOTE: unix time returns seconds, duration expects milliseconds
    return moment.duration((moment(timeNow).unix() - moment(timeStart).unix()) * 1000).format('HH:mm');
};

/** Limits of today
 *
 * @param {object} todayStart - Morning date/time limit of today.
 * @param {object} todayEnd - Evening date/time limit of today.
 *
 * @return {object} Limits of today.
 *
 */

const limitsOfToday = () => {
    var todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    var todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    return {
        todayStart: todayStart,
        todayEnd: todayEnd,
    }
};

module.exports = { timeRemain, timeDuration, limitsOfToday };
