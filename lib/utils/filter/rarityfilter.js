'use strict';

const rarityfilter = [{
    'key': 2,
    'value': 'Common'
}, {
    'key': 3,
    'value': 'Uncommon'
}, {
    'key': 4,
    'value': 'Rare'
}, {
    'key': 5,
    'value': 'Epic'
}, {
    'key': 6,
    'value': 'Legendary'
}];

module.exports = function filter(rarity) {

    if (rarity === null || typeof(rarity) !== 'number') {
        return null;
    }

    // filter names
    for (var l = 0; l < rarityfilter.length; l++) {
        if (rarityfilter[l].key === rarity) {
            return rarityfilter[l].value;
        }
    }

    // if no names were matchted, return the original name
    return rarity;

};
