/**
 *
 * Created by yin on 5/14/15.
 */

"use strict";
var util = require('util');
var shapefile = require('shapefile-stream');
var fs = require('fs');
var JSONStream = require('JSONStream');
var linebyline = require('line-by-line');
var config = require('../config/index');
var logger = require('../common/logger');
var stream = require('stream');

var locationMap;

var signsTransformer = new stream.Transform({objectMode: true});
signsTransformer._transform = function (chunk, encoding, done) {

    var each = JSON.parse(JSON.stringify(chunk));
    if (!isValid(each)) done();
    var sign = {
        point: {x: each.geometry.coordinates[1], y: each.geometry.coordinates[0]},
        boro: each.properties.SG_KEY_BOR,
        orderNumber: each.properties.SG_ORDER_N,
        sequenceNumber: Number(each.properties.SG_SEQNO_N),
        signArrow: each.properties.SG_ARROW_D,
        signDist: Number(each.properties.SR_DIST),
        signId: each.properties.SG_MUTCD_C,
        signDesc: each.properties.SIGNDESC1
    };
    if (sign.signArrow === null)
        sign.signArrow = '';

    if (sign.signDesc === null) {
        sign.signDesc = '';
    } else {
        sign.signDesc = sign.signDesc.replace(/'/g, "''");
    }

    sign.side = locationMap.get(JSON.stringify({boro: sign.boro, orderNumber: sign.orderNumber})) || '';

    var line = util.format("%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
        sign.point.x,
        sign.point.y,
        sign.boro,
        sign.orderNumber,
        sign.sequenceNumber,
        sign.signId,
        sign.signDist,
        sign.signArrow,
        sign.signDesc,
        sign.side);

    this.push(line);
    done();
}

var buildInsertNyparkingSignsQuery = function (localBuffer) {
    var sql = 'insert into nyparking_signs (location, boro, order_number, sequence_number, mutcd, distance, arrow, sign_desc) values ';

    var first = true;
    localBuffer.forEach(function (sign) {
        if (first)
            first = false;
        else
            sql += ' , ';

        sql += util.format("(point(%s, %s), '%s', '%s', %s, '%s', %s, '%s', '%s')",
            sign.point.x, sign.point.y, sign.boro, sign.orderNumber, sign.sequenceNumber,
            sign.signId, sign.signDist, sign.signArrow, sign.signDesc);
    });

    return sql;
}

var isValid = function (sign) {
    if (sign === undefined || sign.geometry === undefined ||
        sign.geometry.coordinates === undefined ||
        sign.geometry.coordinates[0] === undefined || sign.geometry.coordinates[1] === undefined ||
        sign.properties === undefined || sign.properties.SG_KEY_BOR === undefined ||
        sign.properties.SG_ORDER_N === undefined || sign.properties.SG_SEQNO_N === undefined) {

        logger.error('Invalid row ', sign);
        return false;
    }
    return true;
}

var load = function (callback) {
    var targetStream = fs.createWriteStream(config.nyparkingDumpFile, {flags: 'w'});
    loadLocationFileToCache(config.locationsFile, function (error, result) {
        if (error) {
            console.error(error);
            process.exit(1);
        }

        locationMap = result;
        console.log('reading shape file');
        var stream = shapefile.createReadStream(config.shapeFileUnzipped).pipe(signsTransformer).pipe(targetStream);
        stream
            .on('close', function () {
                console.log('%s generated.', config.nyparkingDumpFile);
                callback();
            });
    })
}

var loadLocationFileToCache = function (locationFileDir, cb) {
    const locationMap = new Map();

    const locStream = new linebyline(config.locationsFile);

    locStream
        .on('line', function (data) {
            const line = data.split(',');
            locationMap.set(JSON.stringify({boro: line[0], orderNumber: line[1]}), line[5]);
        })
        .on('error', function (err) {
            console.error('error on parsing line: ', err);
        })
        .on("end", function () {
            console.log('Location file loaded to cache. Size: ', locationMap.size);
            cb(null, locationMap);
        });
};

module.exports = load;
