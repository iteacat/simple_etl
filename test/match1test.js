/**
 *
 * Created by yin on 5/21/15.
 */

var fs = require('fs');
var parser = require('../api/signDescParser');
var config = require('../config/index');
var path = require('path');
var stream = require('stream');
var split = require('split');

var readStream = fs.createReadStream(path.join(process.cwd(), 'tmp', 'nyparking_signs.csv'));
var writeStream = fs.createWriteStream(path.join(process.cwd(), 'tmp', 'match1.txt'));

var filterTransform = new stream.Transform({objectMode: true});
filterTransform._transform = function (chunk, encoding, done) {
    var tokens = chunk.split(',');
    var signDesc = tokens[8];
    var result = parser.match1(signDesc);
    if (result)
        this.push(JSON.stringify({origin: signDesc, result: result}) + '\n');
    done();
}

var finalStream = readStream.pipe(split()).pipe(filterTransform).pipe(writeStream);
finalStream.on('finish', function() {
    console.log('donw');
})
