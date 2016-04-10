'use strict';

const request = require('request');
const dbm = require('./dbmanager');
const knex = require('../db');
const async = require('async');
const config = require('../../config');
const setfilter = require('../utils/filter/setfilter');
const Promise = require('bluebird');
const logger = require('../logger');
const _ = require('underscore');

module.exports = {

  /**
   * @function Starts the whole process of updating already inserted sale data
   */
  update: function() {

    return new Promise(function(resolve, reject) {

      let names = [];
      // find all card names
      dbm.objectNames()
        .then(function(_names) {
          names = _.uniq(_names);
          // find everything that needs updates
          // which is either a card with any missing value or which is an object without a proper name value yet
          const query = [
            'select internal, type, rarity, aa, ea from sales',
            'where (type = \'Card\' and (name is null or setid is null))',
            'or (type != \'Card\' and rarity is null)',
            'group by internal, type, rarity, aa, ea'
          ].join(' ');

          return knex.raw(query);
        })
        .then(function(stuffToUpdate) {

          logger.info(`Trying to update ${stuffToUpdate.rows.length} articles`);

          // update for all of these
          const funcArray = [];
          stuffToUpdate.rows.forEach(function(i) {
            funcArray.push(function(_callback) {
              module.exports.updateSingle(i, names, _callback);
            });
          });

          async.parallelLimit(funcArray, 2, function(errors, results) {
            if (errors) {
              return reject(errors);
            } else {
              return resolve([]);
            }
          });

        })
        .catch(reject);

    }); // promise

  },

  /**
   * @function Updates details for a single article
   * @param {object} article -  An article with `internal`, `rarity`, `aa` and `ea`
   * @param {array} names - An array of names we have infos for (aka found in hex-database-api)
   */
  updateSingle: function(article, names, callback) {

    // check if `names` contains the `internal` string of the article without commas, etc.
    const foundNames = names.filter(function(n) {
      return n.split(',').join('').toLowerCase() === article.internal.toLowerCase();
    });

    // were we successful? if not cancel this
    if (foundNames.length === 0) {
      logger.info(`could not find ${article.internal}, ${article.rarity} by name`);
      return callback(null, null);
    }

    const mappedName = foundNames[0];
    // now build the request to send to hexdatabaseapi to retrieve the missing parts for the object
    const requestBody = {
      name: mappedName,
      rarity: article.rarity
    };

    const options = {
      headers: {
        'content-type': 'application/json'
      },
      uri: config.apiUrl,
      method: 'POST',
      json: requestBody
    };

    request(options, function(error, response, body) {

      if (error) {
        return callback(error);
      }

      if (response.statusCode !== 200) {
        return callback(new Error(`error connecting to hexdatabaseapi (${response.statusCode}, ${JSON.stringify(body)})`));
      }

      // check how much data we got, since there might be no object that meets our criteria
      if (body.length === 0) {
        logger.info(`[shouldnothappen] there is no data for ${article.internal}, ${article.rarity}`);
        return callback(null, null);
      }

      // if there is exactly one or more result objects, take the first one and write its' data to the database
      // choosing the first one should be fine since all results are ordered ascendingly, so longer named objects come later
      let newData = body[0]; // copy data from the reponse so we don't have to know its contents

      // build the new data objects to insert into the data column for each type of article
      let updatedArticle = {};

      if(article.type === 'Card') {

        // build extended name for each card
        if (article.aa && article.ea) {
          newData.ename = newData.name + ' EAA';
        } else if (article.aa && !article.ea) {
          newData.ename = newData.name + ' AA';
        } else if (article.ea && !article.aa) {
          newData.ename = newData.name + ' EA';
        }

        updatedArticle.name = newData.name;
        updatedArticle.rarity = newData.rarity;
        updatedArticle.uuid = newData.uuid;
        // copy `aa` if it is true
        if(article.aa) {
          updatedArticle.aa = article.aa;
        }
        // copy `ea` if it is true
        if(article.ea) {
          updatedArticle.ea = article.ea;
        }
        // override the name which will be saved to the db, if there is an extended name based on `aa` and `ea`
        if(newData.ename) {
          updatedArticle.name = newData.ename;
        }
        updatedArticle.setid = newData.set_number;
        // skip set name

        // insert data
        knex('sales')
          .where({
            internal: article.internal,
            rarity: article.rarity
          })
          .update(updatedArticle)
          .asCallback(callback);

        return;

      }

      if(article.type === 'Equipment') {
        updatedArticle.name = newData.name;
        updatedArticle.rarity = newData.rarity;

        // insert data
        knex('sales')
          .where({
            internal: article.internal
          })
          .update(updatedArticle)
          .asCallback(callback);

        return;

      }

      if(article.type === 'Pack') {
        // it would be nice if there was a safe and easy way to find the name/id of a set for each pack, but not possibru atm.
        return callback(null, null);
      }

    });

  }

};
