/**
 *
 * Created by yin on 5/14/15.
 */

var util = require('util');
var shp2json = require('shp2json');
var fs = require('fs');
var JSONStream = require('JSONStream');
var config = require('../config/index');
var etlCommon = require('../common/etlCommon');
var logger = require('../common/logger');

var queryBuffer = [];
var updateCounter = 0;

function updateDb(buffer, callback) {
    console.log('updateDb is called with buffer size ', buffer.length);
    if (buffer.length === 0) {
        return callback();
    }

    var SQL_INSERT_NYPARKING_SIGNS = buildInsertNyparkingSignsQuery(buffer);
    console.log('requiring db connection...');
    etlCommon.getConnection(function (err, conn) {
        console.log('Got DB connection');
        if (err) {
            logger.error('Cao! Error on db connection: ', err);
            process.exit(995);
        }
        conn.query(SQL_INSERT_NYPARKING_SIGNS, function (err, result) {
            if (err) {
                if (err.errno !== 1062)
                    logger.error('error writing to db for %s', SQL_INSERT_NYPARKING_SIGNS, err);
            } else {
                updateCounter += result.affectedRows;
            }
            conn.release();
            callback();
        });
    });
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

// main starts

module.exports = function (callback) {
    var stream = shp2json(fs.createReadStream(config.shapeFile)).pipe(JSONStream.parse(['features', true]));
    stream
        .on('data', function (data) {
            var each = JSON.parse(JSON.stringify(data));
            if (!isValid(each)) return;
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

            queryBuffer.push(sign);
            console.log('current sign : ', sign);
            if (queryBuffer.length > 100) {
                stream.pause();
                updateDb(queryBuffer, function () {
                    queryBuffer.length = 0;
                    stream.resume();
                });
            }
        })
        .on('end', function() {
            updateDb(queryBuffer, function () {
                logger.info('Table nyaprking_signs loaded. # of rows: %d', updateCounter);
                queryBuffer.length = 0;
                callback(null);
            });
        });
}

