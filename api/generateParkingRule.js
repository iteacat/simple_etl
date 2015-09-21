/**
 * Created by yin on 7/11/15.
 */

var fs = require('fs');
var parser = require('../api/signDescParser');
var config = require('../config/index');
var path = require('path');
var stream = require('stream');
var split = require('split');
var _ = require('lodash');

var total = 0;
var calculated = 0;

var filterTransform = new stream.Transform({objectMode: true});
filterTransform._transform = function (chunk, encoding, done) {
    if (chunk.trim().length === 0)
        return done();

    total++;

    var tokens = chunk.split(',');

    var signDesc = tokens[8];

    // an array of result was returned as for one descrition, it may contain multiple regTypes
    var results = parser.match2(signDesc) || parser.match3(signDesc);

    var line = {
        loc: {
            type: "Point",
            coordinates: [parseFloat(tokens[1]), parseFloat(tokens[0])]
        },
        boro: tokens[2],
        orderNumber: tokens[3],
        sequenceNumber: tokens[4],
        arrow: tokens[7],
        desc: tokens[8],
        side: tokens[9]
    }

    var _this = this;
    if (results && results.length >= 1) {
        results.forEach(function (eachResult) {
            var curLine;
            if (eachResult) {
                curLine = _.merge(line,
                    {
                        signType: eachResult.type,
                        signHour: eachResult.hour,
                        signTimeRanges: eachResult.timeFrames,
                        // subDesc is the sign description if the original description have multiple regTypes
                        subDesc: (eachResult.subDesc ? eachResult.subDesc : null)
                    });
                _this.push(JSON.stringify(curLine) + '\n');
                calculated++;
            }

        });
    } else {
        _this.push(JSON.stringify(_.merge(line,
                {
                    signType: null,
                    signHour: null,
                    signTimeRanges: null,
                    subDesc: null
                }
            )) + '\n');
    }

    done();
}

var generateParkingRule = function (callback) {
    var readStream = fs.createReadStream(config.nyparkingDumpFile);
    var writeStream = fs.createWriteStream(config.nyparkingDumpFileWithTimes);

    var finalStream = readStream.pipe(split()).pipe(filterTransform).pipe(writeStream);

    finalStream.on('finish', function () {
        console.log('Identified %d lines of sign descriptions with a total of %d lines', calculated, total);
        callback(null);
    })

    finalStream.on('error', function (err) {
        console.error('Error when calculating sign time ranges');
        callback(err);
    })
};

module.exports = generateParkingRule;
