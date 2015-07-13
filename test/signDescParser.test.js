/**
 *
 * Created by yin on 5/18/15.
 */

var assert = require('assert');
var signDescParser = require('../api/signDescParser');
var config = require('../config/index');

describe('signDescParser module', function () {
    describe('test match1 - NO PARKING <DAY> [<DAY> …] <TIME>-<TIME>', function () {
        it('should identify the type and time frame of the sign desc. If invalid, return null', function () {
            var testCases = [
                {
                    input: 'NO PARKING  WEDNESDAY 8:30AM-9AM',
                    output: {
                        type: 'NO PARKING',
                        timeFrames: [
                            [2 * 1440 + 8 * 60 + 30, 2 * 1440 + 9 * 60]
                        ],
                        hour: null
                    }
                },
                {
                    input: 'NO PARKING TUESDAY WEDNESDAY 8:30AM-9AM',
                    output: {
                        type: 'NO PARKING',
                        timeFrames: [
                            [1 * 1440 + 8 * 60 + 30, 1 * 1440 + 9 * 60],
                            [2 * 1440 + 8 * 60 + 30, 2 * 1440 + 9 * 60]
                        ],
                        hour: null
                    }
                },
                {
                    input: '6 HOUR METERED PARKING MON-FRI 10-11AM SUN 1-2AM',
                    output: null
                }
            ];

            testCases.forEach(function (test) {
                assert.deepEqual(signDescParser.match1(test.input), test.output);
            })
        });
    });

    describe('test match3 - multiple time range', function () {
        it('should identify the type and time frame of the sign desc. If invalid, return null', function () {
            var testCases = [
                {
                    input: '6 HOUR METERED PARKING MON-FRI 10-11AM SUN 1-2AM',
                    output: {
                        type: 'HMP',
                        timeFrames: [
                            [600, 660],
                            [600 + 24 * 60 * 1, 660 + 24 * 60 * 1],
                            [600 + 24 * 60 * 2, 660 + 24 * 60 * 2],
                            [600 + 24 * 60 * 3, 660 + 24 * 60 * 3],
                            [600 + 24 * 60 * 4, 660 + 24 * 60 * 4],
                            [60 + 24 * 60 * 6, 120 + 24 * 60 * 6]
                        ],
                        hour: 6
                    }
                },
                {
                    input: '5 HOUR         PARKING MON-FRI 10-11AM SUN 1-2AM',
                    output: {
                        type: 'HOUR PARKING',
                        timeFrames: [
                            [600, 660],
                            [600 + 24 * 60 * 1, 660 + 24 * 60 * 1],
                            [600 + 24 * 60 * 2, 660 + 24 * 60 * 2],
                            [600 + 24 * 60 * 3, 660 + 24 * 60 * 3],
                            [600 + 24 * 60 * 4, 660 + 24 * 60 * 4],
                            [60 + 24 * 60 * 6, 120 + 24 * 60 * 6]
                        ],
                        hour: 5
                    }
                }
            ];

            testCases.forEach(function (test) {
                assert.deepEqual(signDescParser.match3(test.input), test.output);
            })
        });
    });
});
