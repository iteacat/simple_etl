/**
 *
 * Created by yin on 5/11/15.
 */

module.exports = {
    appName: 'simpleEtlSand'

    ,mysqlConfig: {
        host: 'localhost',
        user: 'root',
        password: null,
        database: 'cat1ny',
        connectionLimit : 20,
        port: '3306'
    }

    ,mongoDbConfig: {
        baseUrl: 'mongodb://localhost:27017/cat1ny?',
        poolSize: 100,
        autoReconnect: true
    }
};
