'use strict';

const moment = require('moment');
const _ = require('lodash');
const rarityfilter = require('./filter/rarityfilter');

module.exports = {

    /**
     * @function Parses the raw content of a sales file and returns a JSON array representation of the data for further use
     * @param {Object} body - Raw sales data content
     * @returns {Array} - An array of sale objects ready to insert into the database
     */
    parseSales: function(body, minifiedUniqueObjectMap) {

        // console.log(minifiedUniqueObjectMap);

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
            sale.name = content[0].trim();
            // let's try to find a better name for you, poor little sale object
            sale.name = minifiedUniqueObjectMap[sale.name.split(' ').join('').toLowerCase()] || sale.name;
            sale.internal = content[0].trim();
            sale.rarity = rarityfilter(parseInt(content[1].trim()));
            sale.currency = content[2].trim()[0] + content[2].trim().toLowerCase().slice(1, content[2].length);
            sale.price = parseInt(content[3].trim());
            sale.date = content[4].trim();

            // determine more properties
            if (parseInt(content[1].trim()) === 5) {
                sale.name = sale.name + ' AA';
            }

            // determine type
            if (parseInt(content[1].trim()) !== 0) {
                sale.type = 'Card';
            } else if (sale.name.indexOf('Set') !== -1 && sale.name.indexOf('Pack') !== -1) {
                sale.type = 'Pack';
            } else {
                sale.type = 'Other'
            }

            // add new sale
            sales.push(sale);

        }

        // sort array by date, currency, name, rarity
        const sortedSales = _.sortBy(sales, ['date', 'currency', 'name', 'rarity']);

        // console.log(sortedSales);
        return sortedSales;

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

    capitalizeFirstLetter: function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }
};
