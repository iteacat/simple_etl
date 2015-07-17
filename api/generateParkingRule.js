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

    var result = parser.match1(signDesc) || parser.match2(signDesc) || parser.match3();

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

    if (result) {
        line = _.merge(line,
            {
                signType: result.type,
                signHour: result.hour,
                signTimeRanges: result.timeFrames
            });
        calculated++;
    }

    this.push(JSON.stringify(line) + '\n');

    done();
}

module.exports = function (callback) {
    var readStream = fs.createReadStream(config.nyparkingDumpFile);
    var writeStream = fs.createWriteStream(config.nyparkingDumpFileWithTimes);

    var finalStream = readStream.pipe(split()).pipe(filterTransform).pipe(writeStream);

    finalStream.on('finish', function () {
        console.log('done with %d of %d lines', calculated, total);
        callback(null);
    })

    finalStream.on('error', function(err) {
        console.error('Error when calculating sign time ranges');
        callback(err);
    })
}
