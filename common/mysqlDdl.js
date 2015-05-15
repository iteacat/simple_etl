/**
 * Created by yin on 5/12/15.
 */

var etlCommon = require('etlCommon');
var logger = require('logger');

exports.createTable = function (sql, callback) {
    etlCommon.getConnection(function (err, conn) {
        if (err) {
            logger.error('Cao! Error getting db connection', err);
            callback(err);
            return;
        }
        conn.query(sql, function (err, result) {
            if (err) {
                logger.error('Cao! Error on create table query %s', sql, err);
            } else {
                logger.log('Table or index created.');
            }
            conn.release();
            callback(null);
        });
    });
};

exports.CREATE_SIGNS_SQL =
    "DROP TABLE IF EXISTS nyp_signs; " +
    "CREATE TABLE nyp_signs " +
    "(" +
    "boro varchar(4) NOT NULL, " +
    "order_number varchar(15) NOT NULL, " +
    "sequence_number INT UNSIGNED NOT NULL, " +
    "distance INT UNSIGNED NOT NULL, " +
    "arrow varchar(5) NOT NULL, " +
    "sign_desc_long varchar(200) NOT NULL, " +
    "mutcd varchar(15) NOT NULL, " +
    "location POINT NOT NULL, " +
    "sign_desc_short varchar(100) NOT NULL, " +
    "street_side VARCHAR(5) NOT NULL, " +
    "PRIMARY KEY (boro, order_number, sequence_number) " +
    ") ENGINE = MYISAM; ";

exports.CREATE_LOCATION_INDEX = "CREATE SPATIAL INDEX nyps_location ON nyp_signs(location); ";

exports.CREATE_NYPARKING_SIGNS_SQL =
    "DROP TABLE IF EXISTS nyparking_signs; " +
    "CREATE TABLE nyparking_signs " +
    "(" +
    "location   POINT NOT NULL, " +
    "boro	VARCHAR(4) NOT NULL, " +
    "order_number	VARCHAR(15) NOT NULL, " +
    "sequence_number	INT UNSIGNED NOT NULL, " +
    "mutcd	VARCHAR(15) NOT NULL, " +
    "distance 	INT UNSIGNED NOT NULL, " +
    "arrow    VARCHAR(5) NOT NULL, " +
    "sign_desc VARCHAR(100) NOT NULL, " +
    "street_side VARCHAR(5) NOT NULL, " +
    "PRIMARY KEY (boro, order_number, sequence_number) " +
    ") ENGINE = MYISAM; " +
    "CREATE SPATIAL INDEX nyds_location ON nyparking_signs(location); ";

exports.CREATE_LOCATIONS_SQL =
    "DROP TABLE IF EXISTS nyp_locations; " +
    "CREATE TABLE nyp_locations " +
    "(" +
    "boro varchar(4) NOT NULL, " +
    "order_number varchar(15) NOT NULL, " +
    "main_street varchar(50) NOT NULL, " +
    "from_street varchar(50) NOT NULL, " +
    "to_street varchar(50) NOT NULL, " +
    "street_side varchar(5) NOT NULL, " +
    "PRIMARY KEY (boro, order_number) " +
    "); ";

