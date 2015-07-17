/**
 *
 * Created by yin on 7/14/15.
 */

var mongo = require('../common/mongoDao');
var assert = require('assert');

var nypCollection = 'nyparking_signs';

var saveRecord = function(record, cb) {
    mongo.getDb(function(err, db) {

        db.collection(nypCollection).save(record, function(err, doc) {
            if (err) return cb(err);

            if (doc.result.ok !== 1) {
                console.error('Failed to insert record ', record);
            }

            return cb(err);
        });
    })
};

var createLocationIndex = function(cb) {
    mongo.getDb(function(err, db) {
        assert.equal(err, null, "failed to get db " + err);

        db.collection(nypCollection).createIndex({
            loc: "2dsphere"
        }, function(err, result) {
            assert.equal(err, null, "failed to create 2d index " + err);

            cb(null);
        })
    });
}

var dropNypCollection = function(cb) {
    mongo.getDb(function(err, db) {
        assert.equal(err, null, "failed to get db " + err);

        db.dropCollection(nypCollection, function(err, result) {
            assert.equal(err, null, "failed to drop nyparking_signs collection " + err);

            return cb(null);
        })
    })
}

module.exports = {
    saveRecord: saveRecord,
    createLocationIndex: createLocationIndex,
    dropNypCollection: dropNypCollection
};
