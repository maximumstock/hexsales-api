'use strict';

exports.up = function(knex, Promise) {

  return Promise.all([

    /*******************************************************
                        DISTINCT ARTICLES
    *******************************************************/

    knex.schema.raw('create materialized view distinct_articles as select distinct name, rarity, type from daily_sales order by name, rarity, type;')

  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([

    knex.schema.raw('drop materialized view distinct_articles;')

  ]);

};
