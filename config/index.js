var _ = require('lodash');
var path = require('path');

var all = {
    appName: 'simpleEtl'

    ,mysqlConfig: {
        port: '3306',
        database: 'cat1ny',
        connectionLimit : 50,
        multipleStatements : true
    }

    ,signsFile: path.join(process.env.NODE_PATH, 'tmp', 'signs.csv')
    ,signsFileUrl: 'http://a841-dotweb01.nyc.gov/datafeeds/ParkingReg/signs.CSV'

    ,locationsFile: path.join(process.env.NODE_PATH, 'tmp', 'locations.csv')
    ,locationsFileUrl: 'http://a841-dotweb01.nyc.gov/datafeeds/ParkingReg/locations.CSV'

    ,shapeFile: path.join(process.env.NODE_PATH, 'tmp', 'shapefile.zip')
    ,shapeFileUnzipped: path.join(process.env.NODE_PATH, 'tmp', 'Parking_Regulation_Shapefile', 'Parking_Regulations.shp')
    ,shapeFileUrl: 'http://a841-dotweb01.nyc.gov/datafeeds/ParkingReg/Parking_Regulation_Shapefile.zip'

    ,nyparkingDumpFile: path.join(process.env.NODE_PATH, 'tmp', 'nyparking_signs.csv')
    ,nyparkingDumpFileWithTimes: path.join(process.env.NODE_PATH, 'tmp', 'nyparking_signs_with_times.txt')
};

var config= _.merge(
    all,
    require('./' + process.env.NODE_ENV + '.js') || {}
);

module.exports = config;
