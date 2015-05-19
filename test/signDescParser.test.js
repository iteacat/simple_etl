/**
 *
 * Created by yin on 5/18/15.
 */

var assert = require('assert');
var signDescParser = require('../api/signDescParser');

describe('signDescParser module', function () {
    describe('test timeFrameToInt', function () {
        it('should parse time to number of minutes elapsed from MID-NIGHT', function () {
            var testCases = [
                {
                    input: {
                        from: '10',
                        to: '11AM'
                    },
                    output: [60*10, 60*11]
                },
                {
                    input: {
                        from: '10:30AM',
                        to: '2PM'
                    },
                    output: [10*60+30, 2*60+720]
                },
                {
                    input: {
                        from: '10',
                        to: '11PM'
                    },
                    output: [10*60+720, 11*60 + 720]
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
                    output: [11*60+30, 2*60+30 + 720]
                },
                {
                    input: {
                        from: '1PM',
                        to: '2PM'
                    },
                    output: [1*60+720, 2*60+720]
                },
                {
                    input: {
                        from: '9AM' ,
                        to: 'NOON'
                    },
                    output:[540, 720]
                }
            ];

            testCases.forEach(function(testCase) {
                console.log(testCase);
                assert.deepEqual(signDescParser.timeFrameToInt(testCase.input), testCase.output);
            });
        });
    });
});
