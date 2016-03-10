'use strict';

const setfilter = [{
  'key': ['001', 'PVP001'],
  'value': 'Shards of Fate'
}, {
  'key': ['002', 'PVP002'],
  'value': 'Shattered Destiny'
}, {
  'key': ['003', 'PVP003'],
  'value': 'Armies of Myth'
}, {
  'key': ['PVE001'],
  'value': 'Frostring Arena'
}];

/**
 * @function Transforms a number, which describes an id of a card set value, into the corresponding string equivalent
 * @param {String} setId - The id of the card set to find a proper name for
 * @return {String} - A string representation of the specified set or `setId`
 */
module.exports = function filter(setId) {

  if (setId === null || typeof(setId) !== 'string') {
    return null;
  }

  // filter names
  for (var l = 0; l < setfilter.length; l++) {
    if (setfilter[l].key.indexOf(setId.toLowerCase()) > -1) {
      return setfilter[l].value;
    }
  }

  // if no names were matched, return the original name
  return setId;

};
