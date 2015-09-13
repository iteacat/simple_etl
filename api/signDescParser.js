/**
 * This parser uses a cascade of matchers. For example, matcher2 is used only when matcher1 didn't match the line etc.
 *
 * Created by yin on 5/16/15.
 */

var logger = require('../common/logger');
var assert = require('assert');

var regType = /((?:NO PARKING)|(?:NO STANDING)|(?:NO STOPPING)|(?:HOUR PARKING)|(?:\bHMP\b)|(?:\b(?:HR|HOUR)\s+(?:METERED|MUNI-METER) PARKING\b))/g;
var regHourMeteredParking = /((?:\bHMP\b)|(?:\b(?:HR|HOUR)\s+(?:METERED|MUNI-METER) PARKING\b))/g;
var regHourParking = /HOUR\s+PARKING/g;
var regHour = /(\b\d{1,2})\s+(?:(?:\bHOUR PARKING\b)|(?:\bHMP\b)|(?:\b(?:HR|HOUR) (?:METERED|MUNI-METER) PARKING\b))/g;
var regTimeRange = /((?:\d{1,2}:{0,1}\d{0,2}(?:AM|PM){0,1})|MIDNIGHT|NOON)\s*(?:-|TO)\s*((?:\d{1,2}:{0,1}\d{0,2}(?:AM|PM){0,1})|MIDNIGHT|NOON)/g;
var regWeekDay = /\b(MONDAY|MON|TUESDAY|TUES|WEDNESDAY|WED|THURSDAY|THURS|FRIDAY|FRI|FR\sI|FR|SATURDAY|SAT|SUNDAY|SUN|SU)\b/g;

var regUncertain1 = /\bNO\b.*\bMETERED\b\s+\bPARKING\b/g;

var TYPE = {
    HP: "HOUR PARKING",
    HMP: "HMP",
    NP: "NO PARKING",
    NSTD: "NO STANDING",
    NSP: "NO STOPPING"
}

var dayToInt = {
    "SUNDAY": 0,
    "SUN": 0,
    "MONDAY": 1,
    "MON": 1,
    "TUESDAY": 2,
    "TUES": 2,
    "WEDNESDAY": 3,
    "WED": 3,
    "THURSDAY": 4,
    "THURS": 4,
    "FRIDAY": 5,
    "FRI": 5,
    "FR I": 5,
    "SATURDAY": 6,
    "SAT": 6
};

var intToDay = {
    0: "SUNDAY",
    1: "MONDAY",
    2: 'TUESDAY',
    3: 'WEDNESDAY',
    4: 'THURSDAY',
    5: 'FRIDAY',
    6: 'SATURDAY'
};

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
        to = 1440;
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

var parseTimeRanges = function(str) {
    var ret1 = null;
    var timeRanges = [];
    while ((ret1 = regTimeRange.exec(str)) !== null) {
        var result = {
            type: 'TIME',
            value: {from: ret1[1], to: ret1[2]},
            index: ret1.index
        };
        timeRanges.push(result);
    }
    return timeRanges;
};

/*
 * input: ...TUES THURS FRI MON - FRI SAT SUN...
 * output: [[TUES THURS FRI], [SAT SUN]]
 *
 * */
var parseDayOfWeekList = function(str) {
    var copyStr = str;
    // First filter the Day of Week ranges
    var filterThru = regWeekDay.source + /\s*/.source + /(?:\bTHRU\b|-|\bTO\b)/.source + /\s*/.source + regWeekDay.source;
    function replacer(match) {
        var mask = '';
        for (var i = 0; i < match.length; i++) {
            mask += 'x';
        }
        return mask;
    }
    copyStr = copyStr.replace(new RegExp(filterThru, 'g'), replacer);

    var regStr = /\bEXCEPT\b\s+/.source + regWeekDay.source;
    var reg = new RegExp(regStr, 'g');
    copyStr = copyStr.replace(reg, replacer);

    var days = [];
    var temp = null;
    while((temp = regWeekDay.exec(copyStr)) !== null) {
        days.push({
            type: 'DAY',
            value: [temp[1]],
            index: temp.index
        });
    }


    return days;
}

var getDays = function(fromDay, toDay) {
    var days = [];
    for (var i = dayToInt[fromDay]; i <= dayToInt[toDay]; i++) {
        days.push(intToDay[i]);
    }
    return days;
}

/*
 * input: .... MON TUES WED-FRI SAT-SUN
 * output: [[WED, THURS, FRI], [SAT, SUN]]
 */
var parseDayOfWeekRanges = function (str) {
    var regStr =
        regWeekDay.source + /\s*/.source + /(?:\bTHRU\b|-|\bTO\b)/.source + /\s*/.source + regWeekDay.source;
    var reg = new RegExp(regStr, 'g');
    var result = [];
    var temp = null;
    while ((temp = reg.exec(str)) !== null) {
        result.push({
            type: 'DAY',
            value: getDays(temp[1], temp[2]),
            index: temp.index
        });
    }

    var shortcutReg = /\bM-F\b/g;
    while ((temp = shortcutReg.exec(str)) !== null) {
        result.push({
            type: 'DAY',
            value: getDays('MON', 'FRI'),
            index: temp.index
        });
    }
    return result;
}

var parseExceptDay = function(str) {
    var regStr = /\bEXCEPT\b\s+/.source + regWeekDay.source;
    var reg = new RegExp(regStr, 'g');
    var result = [];
    var temp = null;
    while ((temp = reg.exec(str)) !== null) {
        var days = [];
        var exceptDay = temp[1];
        for (var i = 0; i <= 6; i++) {
            if (dayToInt[exceptDay] !== i) {
                days.push(intToDay[i]);
            }
        }
        result.push({
            type: 'DAY',
            value: days,
            index: temp.index
        })
    }
    return result;
}

var parseAll = function(str) {
    var ret = [];

    var temp = null;
    temp = parseDayOfWeekList(str);
    if (temp && temp.length > 0) {
        ret = ret.concat(temp);
    }

    temp = parseDayOfWeekRanges(str);
    if (temp && temp.length > 0) {
        ret = ret.concat(temp);
    }

    temp = parseTimeRanges(str);
    if (temp && temp.length > 0) {
        ret = ret.concat(temp);
    }

    temp = parseExceptDay(str);
    if (temp && temp.length > 0) {
        ret = ret.concat(temp);
    }

    if (ret.length < 1)
        return null;

    ret.sort(function(a, b) {
        return a.index - b.index;
    });

    var calculatedTimeFrames = [];

    var times = [];
    var days = [];
    var state = 0;
    for (var i = 0; i < ret.length; i++) {
        if (i === 0 || (ret[i - 1].type !== ret[i].type)) {
            state++;
        }

        if (ret[i].type === 'DAY')
            days = days.concat(ret[i].value);
        else
            times.push(ret[i].value);

        if (state === 2 && (i === ret.length - 1 || ret[i].type !== ret[i + 1].type)) {
            times.forEach(function(time) {
                days.forEach(function(day) {
                    calculatedTimeFrames.push(getTimeFrame(day, time));
                    //calculatedTimeFrames.push(day);
                    //calculatedTimeFrames.push(time);
                })
            });
            state = 0;
            times.length = 0;
            days.length = 0;
        }
    }

    return calculatedTimeFrames;
}

var replaceIncludingSunday = function(str) {
    return str.replace(/INCLUDING\s+(?:SUNDAY|SUN)/, 'SUN MON TUES WED THURS FRI SAT');
}

var normalizeHourParking = function(str) {
    return str.replace(regHourParking, TYPE.HP);
}

var normalizeHourMeteredParking = function(str) {
    return str.replace(regHourMeteredParking, TYPE.HMP);
}

var replaceAllDays = function(str) {
    return str.replace(/ALL\s+DAYS/, 'SUN MON TUES WED THURS FRI SAT');
}

// NO PARKING/STANDING/STOPPING [<DAY> [TO/THRU/-] […] <TIME>-<TIME>] ...
var generalMatch = function (str) {

    if (!str)
        return null;

    var ret1;

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

    // filter MON THRU/TO/- FRI
    var filterThru =
        regWeekDay.source + /\s*/.source + /(?:\bTHRU\b|-|\bTO\b)/.source + /\s*/.source + regWeekDay.source;
    var regFilterThru = new RegExp(filterThru, 'g');
    var result = null;
    if ((result = regFilterThru.exec(str)) !== null)
        return match1Thru(types[0], result[1], result[2], timeRange[0]);

    // filter EXCEPT MON
    var filterExcept = /\bEXCEPT\b/.source + /\s+/.source + regWeekDay.source;
    var regFilterExcept = new RegExp(filterExcept, 'g');
    if ((result = regFilterExcept.exec(str)) !== null)
        return match1Except(types[0], result[1], timeRange[0]);

    // filter INCLUDING SUNDAY
    //var filterIncluding = /INCLUDING SUNDAY|SUN/g;
    //if (filterIncluding.test(str))
      //  return null;

    var timeFrames = [];
    weekDays.forEach(function (dayOfWeek) {
        timeFrames.push(getTimeFrame(dayOfWeek, timeRange[0]));
    });

    return {
        type: types[0],
        timeFrames: timeFrames,
        hour: null
    }
}

var match1 = function(str) {
    if (!str)
        return null;
    str = preprocess(str);

    var ret = generalMatch(str);

    if (!ret)
        return null;

    ret.hour = getSingleHour(str);

    return ret;
}

function getSingleHour(str) {
    var hours = [];
    var hour;
    while ((hour = regHour.exec(str)) !== null) {
        hours.push(hour[1])
    }
    if (hours.length === 1)
        return hours[0];
    return null;
}

// NO PARKING/STOPPING/STANDING ANYTIME
var match2 = function(str) {
    if (!str)
        return null;
    str = preprocess(str);

    var reg = new RegExp(regType.source + /\s+\bANYTIME\b/.source, 'g');
    var types = [];
    var result = null;
    while ((result = reg.exec(str)) !== null) {
        types.push(result[1]);
    }

    if (types.length !== 1) {
        return null;
    }

    return {
        type: types[0],
        timeFrames: [[0, 1440 * 7]],
        hour: null
    };
}

var match1Except = function(type, exceptDay, timeRange) {
    var timeFrames = [];
    for (var i = 0; i <= 6; i++) {
        if (dayToInt[exceptDay] !== i) {
            timeFrames.push(getTimeFrame(intToDay[i], timeRange));
        }
    }
    return {
        type: type,
        timeFrames: timeFrames,
        hour: null
    };
};

var match1Thru = function(type, dayOfWeekFrom, dayOfWeekTo, timeRange) {
    var timeFrames = [];
    for (var i = dayToInt[dayOfWeekFrom]; i <= dayToInt[dayOfWeekTo]; i++) {
        timeFrames.push(getTimeFrame(intToDay[i], timeRange));
    }
    return {
        type: type,
        timeFrames: timeFrames,
        hour: null
    };
};

var removeCommercialVehicles = function (str) {
    var tokens =  str.split(/COMMERCIAL VEHICLES ONLY OTHERS/);
    return tokens.length > 1 ? tokens[1] : str;
}

var match3 = function(str) {
    if (!str)
        return null;
    str = preprocess(str);

    if (isUncertain1(str))
        return null;

    var timeRanges =  parseAll(str);
    if (!timeRanges || timeRanges.length === 0)
        return null;

    var type = getSingleType(str);
    if (!type)
        return null;

    var hour = getSingleHour(str);

    return {
        type: type,
        timeFrames: timeRanges,
        hour: hour
    };
}

var getSingleType = function(str) {
    var types = [];
    var ret1;
    while ((ret1 = regType.exec(str)) !== null) {
        types.push(ret1[1]);
    }
    if (types.length !== 1)
        return null;

    return types[0];
}

var preprocess = function(str) {
    str = replaceIncludingSunday(str);
    str = replaceAllDays(str);
    str = removeCommercialVehicles(str);
    str = normalizeHourMeteredParking(str);
    str = normalizeHourParking(str);
    return str;
}

var isUncertain1 = function(str) {
    return regUncertain1.test(str);
}

module.exports = {
    match1: match1,
    match2: match2,
    match3: match3
};
