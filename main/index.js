/**
 * Created by yin on 5/12/15.
 */

var async = require('async');
var tableDdl = require('../api/tableDdl');
var logger = require('../common/logger');
var config = require('../config/index');
var etlCommon = require('../common/etlCommon');
var loadShapeFile = require('../api/loadShapeFile');
var loadLocationsFile = require('../api/loadLocationsFile');
var mkdirp = require('mkdirp');
var extractor = require('../api/extract');


logger.info(config);

async.series([
    async.apply(mkdirp, path.join(process.env.PWD, tmp)),
    tableDdl.createNYParkingSignsTable,
    function (callback) {
        async.parallel([
            // from -> to
            async.apply(etlCommon.downloadFile, config.signsFileUrl, config.signsFile),
            async.apply(etlCommon.downloadFile, config.shapeFileUrl, config.shapeFile),
            async.apply(etlCommon.downloadFile, config.locationsFileUrl, config.locationsFile),
        ], function (err) {
            callback(err);
        })
    },
    loadShapeFile,
    loadLocationsFile,
    extractor.extractNyparking
], function (err) {
    if (err) logger.error(err);
    else logger.info('simple-etl DONE :)')
    process.exit(0);
});
