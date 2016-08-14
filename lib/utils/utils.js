'use strict';

const moment = require('moment');
const _ = require('lodash');
const rarityfilter = require('./filter/rarityfilter');
const logger = require('../logger');
const config = require('../../config');

module.exports = {

    /**
     * @function Parses the raw content of a sales file and returns a JSON array representation of the data for further use
     * @param {Array} body - Raw sales data content
     * @param {Object} articleHashMap - A hashmap of all articles mapped by their UUIDs (eg. <UUID> => {name: 'Argus, Herald of Doom', rarity: 'Legendary', ...})
     * @returns {Array} - An array of sale objects ready to insert into the database
     */
    parseSales: function(body, articleHashMap) {

        const sales = []; // array which holds all sales
        const rows = body.split('\n');

        const notFoundArticles = [];

        for (var i = 0; i < rows.length; i++) {

            const row = rows[i];
            // skip empty rows
            if(row.length < 5) {
                continue;
            }

            const content = row.split(',');
            // skip short rows
            if (content.length < 6) {
                continue;
            }
            const uuid = content[5].trim();

            let internalName = content[0].trim();
            config.articleNameSpecialCharacters.forEach(function(sc) {
                internalName = internalName.split(sc).join('');
            });
            let sale = {}; // holds sale information
            sale.aa = false; // set default
            const mappedArticle = articleHashMap[uuid];

            if(!mappedArticle) {
                notFoundArticles.push(internalName);
                continue;
            }

            /*
             * First grab all article related data
             */

            // UUID of the article should be highly relevant
            sale.uuid = mappedArticle.uuid;
            // Actual name of the article
            sale.name = mappedArticle.name;
            // determine more properties
            if (parseInt(content[1].trim()) === 5) {
                sale.name = sale.name + ' AA';
                sale.aa = true;
            }
            // Rarity
            sale.rarity = mappedArticle.rarity;
            // Set
            sale.set = mappedArticle.set_number.split('_').join(' ');
            // Type
            if (parseInt(content[1].trim()) !== 0) {
                sale.type = 'Card';
            } else if (sale.name.indexOf('Set') !== -1 && sale.name.indexOf('Pack') !== -1) {
                sale.type = 'Pack';
            } else if (mappedArticle.type.indexOf('Equipment') !== -1) {
                sale.type = 'Equipment';
            } else {
                sale.type = 'Other'
            }

            /*
             * Second grab all sale related data
             */

            // Currency
            sale.currency = module.exports.capitalizeFirstLetter(content[2]);
            // Price
            sale.price = parseInt(content[3].trim());
            // Date
            sale.date = content[4].trim();

            // add new sale
            sales.push(sale);

        }

        if(notFoundArticles.length > 0) {
            logger.info(`Could not find any matching articles in hexdb for ${_.uniq(notFoundArticles)}`);
        }

        // console.log(sortedSales);
        return sales;

    },

    // /**
    //  * @function Finds a numeric value for a string representation of a rarity to sort through it
    //  * @param {string} rarity The rarity to find a numeric representation for
    //  * @returns {integer} An integer representing the given rarity as a number
    //  */
    // getNumericRarity: function(rarity) {
    //     switch (rarity) {
    //         case 'Common':
    //             return 2;
    //         case 'Uncommon':
    //             return 3;
    //         case 'Rare':
    //             return 4;
    //         case 'Epic':
    //             return 5;
    //         case 'Legendary':
    //             return 6;
    //         case 'Normal':
    //             return -1;
    //         case 'Primal':
    //             return -2;
    //         default:
    //             return 0;
    //     }
    // },

    capitalizeFirstLetter: function(string) {
        string = string.trim();
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }
};
