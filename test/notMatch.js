/**
 * Created by yin on 5/23/15.
 *
 */

var fs = require('fs');
var parser = require('../api/signDescParser');
var config = require('../config/index');
var path = require('path');
var stream = require('stream');
var split = require('split');

var readStream = fs.createReadStream(path.join(process.env.NODE_PATH, 'tmp', 'nyparking_signs.csv'));
var writeStream = fs.createWriteStream(path.join(process.env.NODE_PATH, 'tmp', 'nomatch.txt'));

var filterTransform = new stream.Transform({objectMode: true});
filterTransform._transform = function (chunk, encoding, done) {
    var tokens = chunk.split(',');
    var signDesc = tokens[8];
    var result = parser.match1(signDesc) || parser.match2(signDesc) || parser.match3(signDesc);
    if (!result) {
        this.push(signDesc + '\n');
    }
    done();
}

var finalStream = readStream.pipe(split()).pipe(filterTransform).pipe(writeStream);
finalStream.on('finish', function() {
    console.log('done');
})

