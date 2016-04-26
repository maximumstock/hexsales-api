'use strict';

exports.up = function(knex, Promise) {
  return Promise.all([

    knex.schema.createTableIfNotExists('sales', function(t) {
      t.bigIncrements().primary();
      t.charset('utf8');
      // sale related data
      t.string('name'); // modified internal string
      t.date('date');
      t.integer('price');
      t.integer('currency'); // 1 => 'Platinum', 2 => 'Gold'

    }),

    knex.schema.raw('create index sales_currency_idx on sales("currency");'),
    knex.schema.raw('create index sales_name_idx on sales("name");'),
    knex.schema.raw('create index sales_date_idx on sales("date");'),

  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([

    knex.schema.dropTableIfExists('sales'),

    knex.schema.raw('drop index if exists sales_date_idx;'),
    knex.schema.raw('drop index if exists sales_name_idx;'),
    knex.schema.raw('drop index if exists sales_currency_idx;'),

  ]);

};
