'use strict';

const setfilter = [{
    'key': '001',
    'value': 'Shards of Fate'
}, {
    'key': '002',
    'value': 'Shattered Destiny'
}, {
    'key': '003',
    'value': 'Armies of Myth'
}, {
    'key': 'PVE001',
    'value': 'Frostring Arena'
}];

module.exports = function filter(setId) {

    if (setId === null || typeof(setId) !== 'string') {
        return null;
    }

    // filter names
    for (var l = 0; l < setfilter.length; l++) {
        if (setfilter[l].key.toLowerCase() === setId.toLowerCase()) {
            return setfilter[l].value;
        }
    }

    // if no names were matched, return the original name
    return setId;

};
