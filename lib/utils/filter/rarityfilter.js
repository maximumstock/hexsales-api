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


/**
 * @function Transforms a number, which describes a rarity value, into the corresponding string equivalent
 * @param {Number} rarity - The numeric value of the rarity to find a proper string value for
 * @return {String} - A string representation of the specified rarity or null
 */
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

  // if no names were matchted, return null
  return null;

};
