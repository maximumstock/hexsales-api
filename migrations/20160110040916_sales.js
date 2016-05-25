'use strict';

exports.up = function(knex, Promise) {
  return Promise.all([

    /*******************************************************
                        SALES TABLE
    *******************************************************/

    knex.schema.createTableIfNotExists('sales', function(t) {
      t.bigIncrements().primary();
      t.charset('utf8');
      // sale related data
	  t.string('name'); // modified internal string
      t.string('internal');
      t.string('rarity');
      t.string('setid');
      t.string('type');
      t.string('currency');
      t.integer('price');
      t.date('date');
    }),

    knex.schema.raw('create index sales_name_idx on sales("name");'),
    knex.schema.raw('create index sales_internal_idx on sales("internal");'),
    knex.schema.raw('create index sales_rarity_idx on sales("rarity");'),
    knex.schema.raw('create index sales_type_idx on sales("type");'),
    knex.schema.raw('create index sales_setid_idx on sales("setid");'),
    knex.schema.raw('create index sales_currency_idx on sales("currency");'),
    knex.schema.raw('create index sales_date_idx on sales("date");'),


    /*******************************************************
                        DAILY_SALES TABLE
    *******************************************************/

    knex.schema.createTableIfNotExists('daily_sales', function(t) {
      t.bigIncrements().primary();
      t.charset('utf8');
      // aggregated sale data
      t.string('name'); // modified internal string
      t.string('internal');
      t.string('rarity');
      t.string('setid');
      t.string('type');
      t.string('currency');
      t.date('date');
      // aggregated data
      t.integer('total');
      t.integer('quantity');
      t.integer('min');
      t.integer('max');
      t.integer('median');
      t.integer('average');
    }),

    knex.schema.raw('create index dailysales_name_idx on daily_sales("name");'),
    knex.schema.raw('create index dailysales_internal_idx on daily_sales("internal");'),
    knex.schema.raw('create index dailysales_rarity_idx on daily_sales("rarity");'),
    knex.schema.raw('create index dailysales_type_idx on daily_sales("type");'),
    knex.schema.raw('create index dailysales_setid_idx on daily_sales("setid");'),
    knex.schema.raw('create index dailysales_currency_idx on daily_sales("currency");'),
    knex.schema.raw('create index dailysales_date_idx on daily_sales("date");'),


    /*******************************************************
                        DAILY_STATS TABLE
    *******************************************************/
    knex.schema.createTableIfNotExists('daily_stats', function(t) {
      t.bigIncrements().primary();
      t.charset('utf8');
      t.date('date');
      t.string('currency');
      t.integer('total');
      t.integer('quantity')
    }),

    knex.schema.raw('create index dailystats_date_idx on daily_stats("date");')

  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([

    /*******************************************************
                        SALES TABLE
    *******************************************************/
    knex.schema.dropTableIfExists('sales'),

    knex.schema.raw('drop index if exists sales_name_idx;'),
    knex.schema.raw('drop index if exists sales_internal_idx;'),
    knex.schema.raw('drop index if exists sales_rarity_idx;'),
    knex.schema.raw('drop index if exists sales_type_idx;'),
    knex.schema.raw('drop index if exists sales_setid_idx;'),
    knex.schema.raw('drop index if exists sales_currency_idx;'),
    knex.schema.raw('drop index if exists sales_date_idx;'),

    /*******************************************************
                        DAILY_SALES TABLE
    *******************************************************/
    knex.schema.dropTableIfExists('daily_sales'),

    knex.schema.raw('drop index if exists dailysales_name_idx;'),
    knex.schema.raw('drop index if exists dailysales_internal_idx;'),
    knex.schema.raw('drop index if exists dailysales_rarity_idx;'),
    knex.schema.raw('drop index if exists dailysales_type_idx;'),
    knex.schema.raw('drop index if exists dailysales_setid_idx;'),
    knex.schema.raw('drop index if exists dailysales_currency_idx;'),
    knex.schema.raw('drop index if exists dailysales_date_idx;'),

    /*******************************************************
                        DAILY_STATS TABLE
    *******************************************************/
    knex.schema.dropTableIfExists('daily_stats'),

    knex.schema.raw('drop index if exists dailystats_date_idx')

  ]);

};
