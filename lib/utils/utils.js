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
  parseSales: function (rawSales, articleHashMap) {

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
      } else if (type.indexOf("Mercenary") !== -1) {
        sale.type = 'Mercenary';
      } else if (!sale.name.match(/(Stardust|Treasure Chest)/)) {
        sale.type = 'Card'
      } else {
        sale.type = 'Other';
      }

      sales.push(sale);


    });

    return sales;

  },

  parseSalesOld: function (body, articleHashMap) {

    const rawSales = body.split('\n').filter((line) => {
      return line.length > 3;
    }).map((line) => {
      const parts = line.split('\t,\t');
      return {
        uuid: parts[5],
        currency: module.exports.capitalizeFirstLetter(parts[2]),
        price: parseInt(parts[3]),
        date: parts[4]
      }
    });

    const sales = rawSales.map((sale) => {

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
      } else if (type.indexOf("Mercenary") !== -1) {
        sale.type = 'Mercenary';
      } else if (!sale.name.match(/(Stardust|Treasure Chest)/)) {
        sale.type = 'Card'
      } else {
        sale.type = 'Other';
      }

      return sale;

    });

    return sales;

  },

  capitalizeFirstLetter: function (string) {
    string = string.trim();
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  },


  mapSetName: function (string) {

    const mappings = [{
      key: "Set 001",
      value: "Shards of Fate"
    }, {
      key: "Set 002",
      value: "Shattered Destiny"
    }, {
      key: "Set 003",
      value: "Armies of Myth"
    }, {
      key: "Set 004",
      value: "Primal Dawn"
    }, {
      key: "Set 8",
      value: "Dead of Winter"
    }];

    mappings.forEach(mapping => {
      if (string.indexOf(mapping.key) > -1) {
        string = string.replace(mapping.key, mapping.value);
      }
    });

    return string;
  }

};
