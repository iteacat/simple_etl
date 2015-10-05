/**
 * Created by yin on 5/12/15.
 */

var assert = require('assert');
var async = require('async');
var logger = require('../common/logger');
var config = require('../config/index');
var etlCommon = require('../common/etlCommon');
var loadShapeFile = require('../api/loadShapeFile');
var loadLocationsFile = require('../api/loadLocationsFile');
var mkdirp = require('mkdirp');
var extractor = require('../api/extract');
var generateParkingRule = require('../api/generateParkingRule');
var path = require('path');
var populateParkingSignsToDb = require('../api/populateParkingSignsToDb');
var nyparkingDao = require('../api/nyparkingDao');
var mongoDao = require('../common/mongoDao');

assert.notEqual(process.env.NODE_ENV, null, 'NODE_ENV not set');
assert.notEqual(process.env.NODE_PATH, null, 'NODE_PATH not set');

logger.info(config);
console.time('TotalExecutionTime');
async.series(
    [
        // test if mongo db is connected
        function(cb) {
            mongoDao.getDb(function(err, db) {
                return cb(err, db);
            })
        },
        async.apply(mkdirp, path.join(process.env.NODE_PATH, 'tmp')),
        function (callback) {
            async.parallel([
                // from -> to
                async.apply(etlCommon.downloadFile, config.signsFileUrl, config.signsFile),
                async.apply(etlCommon.downloadFile, config.shapeFileUrl, config.shapeFile),
                async.apply(etlCommon.downloadFile, config.locationsFileUrl, config.locationsFile)
            ], function (err) {
                if (err)
                    console.error(err);
                callback(err);
            })
        },
        extractor.unzipShapeFile,
        loadShapeFile,
        generateParkingRule,
        nyparkingDao.dropNypCollection,
        async.apply(populateParkingSignsToDb, config.nyparkingDumpFileWithTimes, nyparkingDao),
        nyparkingDao.createLocationIndex
    ],
    function (err) {
        if (err)
            logger.error(err);
        else
            logger.info('simple-etl DONE :)')
        console.timeEnd('TotalExecutionTime');
        process.exit(0);
    }
);


