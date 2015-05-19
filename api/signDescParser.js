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
exports.timeFrameToInt = function (timeRange) {
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

// NO PARKING <DAY> [<DAY> …] <TIME>-<TIME>
function match1(str) {
    var regType = /((?:NO PARKING)|(?:NO STANDING)|(?:NO STOPPING))/g;
    var regTimeRange = /((?:\d{1,2}:{0,1}\d{0,2}(?:AM|PM){0,1})|MIDNIGHT|NOON)-((?:\d{1,2}:{0,1}\d{0,2}(?:AM|PM){0,1})|MIDNIGHT|NOON)/g;
    var regWeekDayRange = /((?:MON|MONDAY|TUES|TUESDAY|WED|WEDNESDAY|THURS|THURSDAY|FRI|FRIDAY|SAT|SATURDAY|SUN|SUNDAY)-{1,1}(?:MON|MONDAY|TUES|TUESDAY|WED|WEDNESDAY|THURS|THURSDAY|FRI|FRIDAY|SAT|SATURDAY|SUN|SUNDAY){1,1})/g;
    var regWeekDay = /(?:^|\s)(MON|MONDAY|TUES|TUESDAY|WED|WEDNESDAY|THURS|THURSDAY|FRI|FRIDAY|SAT|SATURDAY|SUN|SUNDAY)(?:\s|$)/g;

    var ret1;

    var types = [];
    while ((ret1 = regType.exec(str)) !== null) {
        types.push(ret1[1]);
    }

    var timeRange = [];
    while ((ret1 = regTimeRange.exec(str)) !== null) {
        timeRange.push({from: ret1[1], to: ret1[2]});
    }

    var weekDays = [];
    while ((ret1 = regWeekDay.exec(str)) !== null) {
        weekDays.push(ret1[1]);
    }

    if (types.length === 1 && timeRange.length === 1 && weekDays.length > 0) {
        console.log(types, timeRange, weekDays);
    } else {
        console.log("didn't match");
    }
}

match1("NIGHT REGULATION  NO PARKING  3AM-6AM TUES THURS SAT");

