'use strict';

const moment = require('moment');
const rarityfilter = require('./filter/rarityfilter');
const setfilter = require('./filter/setfilter');

module.exports = {

    /**
     * @function Parses the raw content of a sales file and aggregates wanted data to insert it into daily_sales
     * @param {Object} body Raw sales data content
     * @returns {Array} An array of sale objects ready to insert into the database
     */
    parseSales: function(body) {

        const sales = []; // array to be returned later
        const rows = body.split('\n');

        for (var i = 0; i < rows.length; i++) {

            const row = rows[i];
            // skip empty/short rows
            if (row.length < 5) {
                continue;
            }

            const content = row.split(',');

            // nicefy content
            let obj = {}; // temporary object
            obj.representation = content[0].trim();
            obj.rarity = rarityfilter(parseInt(content[1].trim()));
            obj.currency = module.exports.capitalizeFirstLetter(content[2].trim());
            obj.price = parseInt(content[3].trim());
            obj.date = content[4].trim();
            obj.aa = false;
            obj.ea = false;

            // determine more properties
            if (content[1].trim() === '5') {
                obj.aa = true; // Alternate Art
            }

            // determine which type these sales are for
            if (obj.rarity === 0) {

                obj.name = obj.representation;

                if (obj.name.indexOf('Set') > -1 && obj.name.indexOf('Pack') > -1) {
                    // Booster
                    obj.type = 'Booster';
                    // also save set value
                    let setId = obj.name.split(' ')[1]; // normal structure: Set 001 Booster/Primal...
                    obj.set = setfilter(setId);
                    // name and rarity to avoid updating from hexdbapi
                    if (obj.name.indexOf('Primal') > -1) {
                        obj.rarity = 'Primal';
                        obj.name = setfilter(setId) + ' Primal Pack';
                    } else {
                        obj.rarity = 'Normal';
                        obj.name = setfilter(setId) + ' Booster Pack';
                    }
                } else {
                    // item
                    obj.type = 'Equipment';
                    obj.rarity = rarityfilter(parseInt(content[1].trim())); // doesnt do anything yet, but if they decide to fix their
                    // code, this will be here, waiting...

                    if(obj.rarity === 0) {
                        // if it is still '0', delete it
                        delete obj.rarity;
                    }
                }
            } else {
                // card
                obj.type = 'Card';
                obj.rarity = rarityfilter(parseInt(content[1].trim()));
            }

            sales.push(obj);

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
