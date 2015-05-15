/**
 * Created by yin on 5/12/15.
 */

var http = require('http');
var stripBom = require('strip-bom');
var logger = require('../common/logger');
var mysql = require('mysql');
var fs = require('fs');

var pool  = mysql.createPool(
    require('../config/index.js').mysqlConfig
);

pool.on('enqueue', function () {
    logger.warn('Waiting for available connection slot');
});

pool.on('error', function(err) {
    logger.error('CAO! Error on db connection pool: ', err) ;
});

exports.getConnection = function(callback) {
    pool.getConnection(function(err, connection) {
        if (err) callback(err);
        else
            callback(null, connection);
    });
};

exports.downloadFile = function(from, to, callback) {
    if (fs.existsSync(to)) {
        logger.info('No download. Use existing file ', to);
        callback(null);
    } else {
        var file = fs.createWriteStream(to);
        http.get(from, function (response) {
            response.pipe(stripBom.stream()).pipe(file);
            file.on('finish', function() {
                file.close(function() {
                    callback(null);
                });
            });
            file.on('error', function(err) {
                callback(err);
            });
        });
    }
};
