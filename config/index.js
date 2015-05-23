var _ = require('lodash');
var logger = require('../common/logger');
var path = require('path');

var all = {
    appName: 'simpleEtl'

    ,mysqlConfig: {
        port: '3306',
        database: 'cat1ny',
        connectionLimit : 50,
        multipleStatements : true
    }
    ,signsFile: path.join(process.cwd(), 'tmp', 'signs.csv')
    ,signsFileUrl: 'http://a841-dotweb01.nyc.gov/datafeeds/ParkingReg/locations.CSV'

    ,locationsFile: path.join(process.cwd(), 'tmp', 'locations.csv')
    ,locationsFileUrl: 'http://a841-dotweb01.nyc.gov/datafeeds/ParkingReg/signs.CSV'

    ,shapeFile: path.join(process.cwd(), 'tmp', 'shapefile.zip')
    ,shapeFileUrl: 'http://a841-dotweb01.nyc.gov/datafeeds/ParkingReg/Parking_Regulation_Shapefile.zip'

};

var config= _.merge(
    all,
    require('./' + process.env.NODE_ENV + '.js') || {}
);

module.exports = config;
