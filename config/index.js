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

    ,mongoDbConfig: {
        baseUrl: 'mongodb://localhost:27017/cat1ny?',
        poolSize: 100,
        autoReconnect: true
    }

    ,signsFile: path.join(process.cwd(), 'tmp', 'signs.csv')
    ,signsFileUrl: 'http://a841-dotweb01.nyc.gov/datafeeds/ParkingReg/signs.CSV'

    ,locationsFile: path.join(process.cwd(), 'tmp', 'locations.csv')
    ,locationsFileUrl: 'http://a841-dotweb01.nyc.gov/datafeeds/ParkingReg/locations.CSV'

    ,shapeFile: path.join(process.cwd(), 'tmp', 'shapefile.zip')
    ,shapeFileUnzipped: path.join(process.cwd(), 'tmp', 'Parking_Regulation_Shapefile', 'Parking_Regulations.shp')
    ,shapeFileUrl: 'http://a841-dotweb01.nyc.gov/datafeeds/ParkingReg/Parking_Regulation_Shapefile.zip'

    ,nyparkingDumpFile: path.join(process.cwd(), 'tmp', 'nyparking_signs.csv')
    ,nyparkingDumpFileWithTimes: path.join(process.cwd(), 'tmp', 'nyparking_signs_with_times.txt')
};

var config= _.merge(
    all,
    require('./' + process.env.NODE_ENV + '.js') || {}
);

module.exports = config;
