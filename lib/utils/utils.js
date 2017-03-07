'use strict';

const moment = require('moment');
const _ = require('lodash');
const rarityfilter = require('./filter/rarityfilter');
const logger = require('../logger');
const config = require('../../config');

module.exports = {

	/**
	 * @function Parses the raw content of a sales file and returns a JSON array representation of the data for further use
	 * @param {Array} rawSsales - sales array
	 * @param {Object} articleHashMap - A hashmap of all articles mapped by their UUIDs (eg. <UUID> => {name: 'Argus, Herald of Doom', rarity: 'Legendary', ...})
	 * @returns {Array} - An array of sale objects ready to insert into the database
	 */
	parseSales: function(rawSales, articleHashMap) {

		const sales = []
		rawSales.forEach((sale) => {

			sale.aa = false; // as default

			// try to map UUID to article
			const mappedArticle = articleHashMap[sale.uuid];
			if (!mappedArticle) {
				logger.info(`Could not find article for UUID ${sale.uuid}`);
				return;
			}

			/*
			 * First grab all article related data
			 */
			sale.name = mappedArticle.name;

			// CUSTOM NAME MAPPING
			// As of 2016-09-08 packs are now called '<Set name> <Booster|Primal> Pack', so we should map older names to
			// the new format
			if (sale.name.match(/^Set.*(Booster|Primal) Pack$/)) {
				sale.name = module.exports.mapSetName(sale.name);
			}

			// determine more properties
			if (mappedArticle.rarity === 'Epic') {
				sale.name = sale.name + ' AA';
				sale.aa = true;
			}
			// Rarity
			sale.rarity = mappedArticle.rarity;
			// Set
			sale.set = mappedArticle.set_number.split('_').join(' ');
			// Type
			const type = mappedArticle.type;
			if (sale.name.match(/(Booster|Primal) Pack$/)) {
				sale.type = 'Pack';
			} else if (type.indexOf('Equipment') !== -1) {
				sale.type = 'Equipment';
			} else if (type.length !== 0) {
				sale.type = 'Card';
			} else {
				sale.type = 'Other';
			}

			sales.push(sale);


		});

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
	},


	mapSetName: function(string) {
		switch (string) {
			case 'Set 001 Booster Pack':
				return 'Shards of Fate Booster Pack';
			case 'Set 001 Primal Pack':
				return 'Shards of Fate Primal Pack';
			case 'Set 002 Booster Pack':
				return 'Shattered Destiny Booster Pack';
			case 'Set 002 Primal Pack':
				return 'Shattered Destiny Primal Pack';
			case 'Set 003 Booster Pack':
				return 'Armies of Myth Booster Pack';
			case 'Set 003 Primal Pack':
				return 'Armies of Myth Primal Pack';
			case 'Set 004 Booster Pack':
				return 'Primal Dawn Booster Pack';
			case 'Set 004 Primal Pack':
				return 'Primal Dawn Primal Pack';
		}
	}

};
