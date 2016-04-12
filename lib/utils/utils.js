'use strict';

const moment = require('moment');
const _ = require('underscore');
const rarityfilter = require('./filter/rarityfilter');
module.exports = {

  /**
   * @function Parses the raw content of a sales file and returns a JSON array representation of the data for further use
   * @param {Object} body - Raw sales data content
   * @returns {Array} - An array of sale objects ready to insert into the database
   */
  parseSales: function(body) {

    const sales = []; // array which holds all sales
    const rows = body.split('\n');

    for (var i = 0; i < rows.length; i++) {

      const row = rows[i];
      // skip empty/short rows
      if (row.length < 5) {
        continue;
      }

      const content = row.split(',');

      let sale = {}; // holds sale information

      // sale related data
      sale.currency = module.exports.capitalizeFirstLetter(content[2].trim());
      sale.price = parseInt(content[3].trim());
      sale.date = content[4].trim();
      sale.aa = false;
      sale.ea = false;

      // article related data
      sale.internal = content[0].trim();
      sale.rarity = rarityfilter(parseInt(content[1].trim()));

      // determine more properties
      if (content[1].trim() === '5') {
        sale.aa = true; // object is an AA version of a card
      }

      // @TODO add extended art support once it is available
      // if (statement) {
      //   sales.ea = true;
      // }

      // determine which type this sale is
      if (sale.rarity === 0) {

        sale.name = sale.internal; // for everything other than cards this is usually true
        // names of items will still be updated if there is another one

        // if it is a pack
        if (sale.internal.indexOf('Set') > -1 && sale.internal.indexOf('Pack') > -1) {

          // Pack names should be fine, so just use the provided name value
          // Names of cards and equipment however, might need more fiddling since they might contain commas or other
          // characters, that were lost in translation of the sales files

          sale.type = 'Pack';
          // also save setid, but drop the name of the set, since we cannot know that
          // the name of a set is actually implicitly given by it's setid
          sale.setid = sale.internal.split(' ')[1]; // normal structure: Set 001 Pack/Primal Pack

        } else {

          // if it is a piece of equipment
          sale.type = 'Equipment';
          // articleData.rarity = rarityfilter(parseInt(content[1].trim())); // doesnt do anything yet, but if they decide to fix their
          // code, this will be here, waiting...

        }
      } else {
        // if it is a card
        sale.type = 'Card';
      }

      if (sale.rarity === 0) {
        // if rarity is still 0, delete it
        delete sale.rarity;
      }

      // add new sale
      sales.push(sale);

    }

    return sales;

  },

  /**
   * @function
   * @param {string} start A valid date representation of the start date of the range
   * @param {string} start A valid date representation of the end date of the range
   * @param {string} targetDate A valid date representation of the maximum valid date
   * @returns {object} An object containing the new start/end dates
   */
  fixTimespan: function(start, end, targetDate) {

    // roll back timespan by 1 day until we hit the specified max date
    while (moment(end) > moment(targetDate)) {
      start = moment(start).subtract(1, 'days').format('YYYY-MM-DD');
      end = moment(end).subtract(1, 'days').format('YYYY-MM-DD');
    }

    return {
      start: start,
      end: end
    };

  },

  /**
   * @function Finds a numeric value for a string representation of a rarity to sort through it
   * @param {string} rarity The rarity to find a numeric representation for
   * @returns {integer} An integer representing the given rarity as a number
   */
  getNumericRarity: function(rarity) {
    switch (rarity) {
      case 'Common':
        return 2;
      case 'Uncommon':
        return 3;
      case 'Rare':
        return 4;
      case 'Epic':
        return 5;
      case 'Legendary':
        return 6;
      case 'Normal':
        return -1;
      case 'Primal':
        return -2;
      default:
        return 0;
    }
  },

  stringContains: function(haystack, needle) {
    if (haystack.indexOf(needle) === -1) {
      return false;
    } else {
      return true;
    }
  },

  capitalizeFirstLetter: function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }
};
