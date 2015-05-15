/**
 * load locations file and update the streeet_side for nyparking_signs table
 * Created by yin on 5/15/15.
 */

var util = require('util');
var linebyline = require('line-by-line');

var etlCommon = require('../common/etlCommon');
var config = require('../config/index');

var locBuffer = [];
var locCount = 0;

var runLocationUpdate = function (callback) {
    var locStream = new linebyline(config.locationsFile);
    locStream
        .on('line', function (data) {
            locBuffer.push(data.split(','));
            if (locBuffer.length > 100) {
                locStream.pause();
                updateDbLocation(function () {
                    locStream.resume();
                });
            }
        })
        .on('error', function (err) {
            console.error('error on parsing line: ', err);
        })
        .on("end", function () {
            updateDbLocation(function () {
                console.log("Table nyparking_signs updated with %d rows.", locCount);
                setTimeout(callback(), 0);
            });
        });
}

var updateDbLocation = function (callback) {
    if (locBuffer.length === 0) {
        callback();
        return;
    }
    etlCommon.getConnection(function (err, conn) {
        if (err) {
            console.error('Cao! Error getting db connection', err);
            process.exit(998);
        }
        var sql = buildUpdateLocationsQuery(locBuffer);
        locBuffer = [];
        conn.query(sql, function (err, result) {
            if (err) {
                console.error('Cao! Error on update query %s', sql, err);
            } else {
                result.forEach(function (ret) {
                    locCount += ret.affectedRows;
                });
            }
            conn.release();
            callback();
        });
    });
}

var buildUpdateLocationsQuery = function (locations) {
    var SQL = "";
    var addAnd = false;
    locations.forEach(function (loc) {
        if (loc[4] === undefined) {
            console.error('null direction ', loc);
            return;
        }
        if (loc[0] === undefined || loc[1] === undefined) {
            console.error('bad data ', loc);
            return;
        }

        SQL += util.format("update nyparking_signs " +
            "set street_side = '%s' " +
            "where boro = '%s' and order_number='%s'; ",
            loc[5].trim(), loc[0], loc[1]);
    })
    return SQL;
}

module.exports = function (callback) {
    runLocationUpdate(function () {
        callback();
    });
};

