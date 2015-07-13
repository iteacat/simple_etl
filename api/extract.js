/**
 *
 * Created by yin on 5/16/15.
 */

var fs = require('fs');
var etlCommon = require('../common/etlCommon');
var logger = require('../common/logger');
var tableDdl = require('../api/tableDdl');
var path = require('path');
var util = require('util');
var stream = require('stream')

var nyparkingTransformer = new stream.Transform({objectMode: true});
nyparkingTransformer._transform = function (chunk, encoding, done) {
    var data = chunk;
    var line = util.format("%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
        data.location.x,
        data.location.y,
        data.boro,
        data.order_number,
        data.sequence_number,
        data.mutcd,
        data.distance,
        data.arrow,
        data.sign_desc,
        data.street_side);
    this.push(line);
    done();
}

// tableConfig = {
//   name: TABLE_XXX,
//   columns: [A, B, C, D] //
// }
// If columnes is undefined or empty, use all columns
var extract = function (tableConfig, to, transformer, callback) {
    var targetStream = fs.createWriteStream(to, {flags: 'w'});

    etlCommon.getConnection(function (err, conn) {
        var sql = buildQuery(tableConfig);
        conn.query(sql).stream({highWaterMark: 5}).pipe(transformer).pipe(targetStream);
        targetStream
            .on('finish', function () {
                conn.release();
                callback(null);
            })
            .on('error', function(err) {
                conn.release();
                callback(err);
            });
    });
}

var extractNyparking = function (callback) {
    var tableConfig = {
        name: tableDdl.NYPARKING
    }
    var dest = path.join(process.env.PWD, 'tmp', 'nyparking_signs.csv');
    extract(tableConfig, dest, nyparkingTransformer, callback);
}

function buildQuery(tableConfig) {
    var cols;
    if (!tableConfig.columns || tableConfig.column.length === 0) {
        cols = '*';
    } else {
        tableConfig.forEach(function (col) {
            cols += ',' + col;
        });
        cols.splice(0, 1);
    }
    return util.format("select %s from %s ", cols, tableConfig.name);
}

module.exports = {
    extractNyparking: extractNyparking
};
