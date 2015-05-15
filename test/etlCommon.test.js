/**
 *
 * Created by yin on 5/13/15.
 */

var async = require('async');
var assert = require('assert');

describe('etlCommon module', function () {
  describe('test async', function () {
    it('should series excute foo and bar', function () {
      var foo = function (revenue, currency, callback) {
        if (currency === 'USD')
          callback(null, revenue);
        else
          callback(null, revenue * 6);
      };
      var bar = function (cost, callback) {
        callback(null, cost);
      };

      async.series([
        async.apply(foo, 3, 'RMB'),
        async.apply(bar, 5)
      ], function (err, results) {
        assert.equal(results[0], 18);
        assert.equal(results[1], 5);
      });
    });
  });
});
