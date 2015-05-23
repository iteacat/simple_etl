/**
 *
 * Created by yin on 5/21/15.
 */

var extractor = require('../api/extract');

extractor.extractNyparking(function(err) {
    if (err)
        console.error(err);
    else
        console.log('Done.');
    process.exit(0);
})
