var generateParkingRule = require('../api/generateParkingRule');

generateParkingRule(function(err) {
    if (err)
        console.log('errorrrrrrr');
    else
        console.log('done done done');
})