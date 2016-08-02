'use strict';

exports.up = function(knex, Promise) {

  return Promise.all([

    /*******************************************************
                        DISTINCT ARTICLES
    *******************************************************/

    knex.schema.raw('create materialized view distinct_articles as select distinct name, uuid, aa, set, rarity, type from daily_sales order by name;')

  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([

    knex.schema.raw('drop materialized view distinct_articles;')

  ]);

};
