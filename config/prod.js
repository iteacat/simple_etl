/**
 *
 * Created by yin on 5/11/15.
 */

module.exports = {
    appName: 'simpleEtlProd'

    ,mysqlConfig: {
        host: 'cat1ny.ch67iaxvc4uj.us-east-1.rds.amazonaws.com',
        user: 'iteacat',
        password: 'ChafNod9',
        database: 'cat1ny'
    }

    ,mongoDbConfig: {
        baseUrl: 'mongodb://cat1ny:27017/cat1ny?',
        poolSize: 100,
        autoReconnect: true
    }
};
