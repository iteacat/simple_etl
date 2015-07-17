/**
 *
 * Created by yin on 7/15/15.
 */

var fs = require('fs'),
    es = require('event-stream');

var populate = function(file, dao, cb) {
    fs.createReadStream(file, {flags: 'r'})
        .pipe(es.split())
        .pipe(es.through(function write(line) {
            var t = this;
            t.pause();
            if (line.length === 0)
                return t.resume();

            dao.saveRecord(JSON.parse(line), function(err) {
                if (err)
                    console.error('error when saving record ', line);
                t.resume();
            });
        }, function end() {
            cb(null);
        }))
};

module.exports = populate;
