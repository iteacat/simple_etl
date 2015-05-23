/**
 *
 * Created by yin on 5/16/15.
 */

var logger = require('../common/logger');
var assert = require('assert');

function dayOfWeekToInt(dayOfWeek) {
    var MINUTES_OF_DAY = 1440;
    switch (dayOfWeek) {
        case 'MON':
        case 'MONDAY':
            return MINUTES_OF_DAY * 0;
        case 'TUES':
        case 'TUESDAY':
            return MINUTES_OF_DAY * 1;
        case 'WED':
        case 'WEDNESDAY':
            return MINUTES_OF_DAY * 2;
        case 'THURS':
        case 'THURSDAY':
            return MINUTES_OF_DAY * 3;
        case 'FRI':
        case 'FR':
        case 'FR I':
        case 'FRIDAY':
            return MINUTES_OF_DAY * 4;
        case 'SAT':
        case 'SATURDAY':
            return MINUTES_OF_DAY * 5;
        case 'SUN':
        case 'SUNDAY':
            return MINUTES_OF_DAY * 6;
        default:
            logger.error('Invalid day of Week %s', dayOfWeek);
            return -1;
    }
}

// example input -
// 10:30AM - 2:30PM
// 10 - 11AM
// 10PM - MIDNIGHT
// 8:30AM - NOON
// 8 - NOON
var timeFrameToInt = function (timeRange) {
    if (!timeRange || !timeRange.from || !timeRange.to) {
        logger.error('Invalid time range input %s', timeRange);
        return -1;
    }
    var from, to;
    var isPM = false;
    var tmp;

    if (timeRange.to === 'NOON') {
        to = 720;
    } else if (timeRange.to === 'MIDNIGHT') {
        to = 0;
    } else {
        tmp = timeRange.to.split(':');
        assert(tmp.length >= 1 && tmp.length <= 2);
        to = parseInt(tmp[0]) * 60;
        if (tmp.length === 2) {
            to += parseInt(tmp[1]);
        }
        if (timeRange.to.length >= 3 && timeRange.to.substr(timeRange.to.length - 2, 2) === 'PM') {
            to += 720;
            isPM = true;
        }
    }

    if (timeRange.from === 'NOON') {
        from = 720;
    } else if (timeRange.from === 'MIDNIGHT') {
        from = 0;
    } else {
        tmp = timeRange.from.split(':');
        assert(tmp.length >= 1 && tmp.length <= 2);
        from = parseInt(tmp[0]) * 60;
        if (tmp.length === 2) {
            from += parseInt(tmp[1]);
        }
        if (timeRange.from.length >= 3 && timeRange.from.substr(timeRange.from.length - 2, 2) === 'AM') {
            // nothing to do
        } else if (timeRange.from.length >= 3 && timeRange.from.substr(timeRange.from.length - 2, 2) === 'PM') {
            from += 720;
        } else {
            if (isPM)
                from += 720;
        }
    }

    return [from, to];
}

var getTimeFrame = function (dayOfWeek, timeFrame) {
    var ret = timeFrameToInt(timeFrame);
    var dayOfWeekInt = dayOfWeekToInt(dayOfWeek)
    ret[0] += dayOfWeekInt;
    ret[1] += dayOfWeekInt;
    return ret;
};

// NO PARKING <DAY> [<DAY> …] <TIME>-<TIME>
var match1 = function (str) {
    var regType = /((?:NO PARKING)|(?:NO STANDING)|(?:NO STOPPING))/g;
    var regTimeRange = /((?:\d{1,2}:{0,1}\d{0,2}(?:AM|PM){0,1})|MIDNIGHT|NOON)-((?:\d{1,2}:{0,1}\d{0,2}(?:AM|PM){0,1})|MIDNIGHT|NOON)/g;
    var regWeekDayRange = /((?:MON|MONDAY|TUES|TUESDAY|WED|WEDNESDAY|THURS|THURSDAY|FRI|FRIDAY|SAT|SATURDAY|SUN|SUNDAY)-{1,1}(?:MON|MONDAY|TUES|TUESDAY|WED|WEDNESDAY|THURS|THURSDAY|FRI|FRIDAY|SAT|SATURDAY|SUN|SUNDAY){1,1})/g;
    var regWeekDay = /\b(MONDAY|MON|TUESDAY|TUES|WEDNESDAY|WED|THURSDAY|THURS|FRIDAY|FRI|FR\sI|FR|SATURDAY|SAT|SUNDAY|SUN)\b/g;


    var ret1;
    var index = 0;

    var types = [];
    while ((ret1 = regType.exec(str)) !== null) {
        types.push(ret1[1]);
    }
    if (types.length !== 1)
        return null;

    var timeRange = [];
    while ((ret1 = regTimeRange.exec(str)) !== null) {
        timeRange.push({from: ret1[1], to: ret1[2]});
    }
    if (timeRange.length !== 1)
        return null;

    var weekDays = [];
    while ((ret1 = regWeekDay.exec(str)) !== null) {
        weekDays.push(ret1[1]);
    }
    if (weekDays.length < 1)
        return null;

    // ignore MON THRU FRI
    var ignoreThru = regWeekDay.source + /\s+/.source + 'THRU' + /\s+/.source + regWeekDay.source;
    var regIgnoreThru = new RegExp(ignoreThru, 'g');
    if (regIgnoreThru.test(str))
        return null;

    // ignore MON-FRI or MON - FRI
    var ignoreDash = regWeekDay.source + /\s*/.source + '-' + /\s*/.source + regWeekDay.source;
    var regIgnoreDash = new RegExp(ignoreDash, 'g');
    if (regIgnoreDash.test(str))
        return null;

    // ignore EXCEPT MON
    var ignoreExcept = /\bEXCEPT\b/.source + /\s+/.source + regWeekDay.source;
    var regIgnoreExcept = new RegExp(ignoreExcept, 'g');
    if (regIgnoreExcept.test(str))
        return null;

    // ignore INCLUDING SUNDAY
    var ignoreIncluding = /INCLUDING SUNDAY|SUN/g;
    if (ignoreIncluding.test(str))
        return null;

    var timeFrames = [];
    weekDays.forEach(function (dayOfWeek) {
        timeFrames.push(getTimeFrame(dayOfWeek, timeRange[0]));
    });

    return {
        type: types[0],
        timeFrames: timeFrames
    }
}

module.exports = {
    timeFrameToInt: timeFrameToInt,
    match1: match1
};
