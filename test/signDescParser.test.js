/**
 *
 * Created by yin on 5/18/15.
 */

var assert = require('assert');
var signDescParser = require('../api/signDescParser');
var config = require('../config/index');

describe('signDescParser module', function () {
    describe('test timeFrameToInt', function () {
        it('should parse time to number of minutes elapsed from MID-NIGHT', function () {
            var testCases = [
                {
                    input: {
                        from: '10',
                        to: '11AM'
                    },
                    output: [60 * 10, 60 * 11]
                },
                {
                    input: {
                        from: '10:30AM',
                        to: '2PM'
                    },
                    output: [10 * 60 + 30, 2 * 60 + 720]
                },
                {
                    input: {
                        from: '10',
                        to: '11PM'
                    },
                    output: [10 * 60 + 720, 11 * 60 + 720]
                },
                {
                    input: {
                        from: 'MIDNIGHT',
                        to: 'NOON'
                    },
                    output: [0, 720]
                },
                {
                    input: {
                        from: '11:30AM',
                        to: '2:30PM'
                    },
                    output: [11 * 60 + 30, 2 * 60 + 30 + 720]
                },
                {
                    input: {
                        from: '1PM',
                        to: '2PM'
                    },
                    output: [1 * 60 + 720, 2 * 60 + 720]
                },
                {
                    input: {
                        from: '9AM',
                        to: 'NOON'
                    },
                    output: [540, 720]
                }
            ];

            testCases.forEach(function (testCase) {
                assert.deepEqual(signDescParser.timeFrameToInt(testCase.input), testCase.output);
            });
        });
    });

    describe('test match1 - NO PARKING <DAY> [<DAY> …] <TIME>-<TIME>', function () {
        it('should identify the type and time frame of the sign desc. If invalid, return null', function () {
            var testCases = [
                {
                    input: 'NO PARKING  WEDNESDAY 8:30AM-9AM',
                    output: {
                        type: 'NO PARKING',
                        timeFrames: [
                            [2 * 1440 + 8 * 60 + 30, 2 * 1440 + 9 * 60]
                        ]
                    }
                },
                {
                    input: 'NO PARKING TUESDAY WEDNESDAY 8:30AM-9AM',
                    output: {
                        type: 'NO PARKING',
                        timeFrames: [
                            [1 * 1440 + 8 * 60 + 30, 1 * 1440 + 9 * 60],
                            [2 * 1440 + 8 * 60 + 30, 2 * 1440 + 9 * 60]
                        ]
                    }
                }
            ];

            testCases.forEach(function(test) {
                assert.deepEqual(signDescParser.match1(test.input), test.output);
            })
        });
    });
});
