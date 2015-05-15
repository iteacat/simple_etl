/**
 *
 * Created by yin on 5/12/15.
 */
var config = require('../config/index');

var bunyan = require('bunyan');
module.exports = bunyan.createLogger({name: config.appName});

