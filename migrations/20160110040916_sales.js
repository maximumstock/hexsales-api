'use strict';

exports.up = function(knex, Promise) {
  return Promise.all([

    knex.schema.createTableIfNotExists('sales', function(t) {
      t.bigIncrements().primary();
      t.charset('utf8');
      // sale related data
      t.string('name'); // internal string
      t.date('date');
      t.integer('price');
      t.integer('currency'); // 1 => 'Platinum', 2 => 'Gold'
      t.integer('rarity'); // internal rarity mapping
      t.boolean('aa');

    }),

    knex.schema.raw('create index sales_currency_idx on sales("currency");'),
    knex.schema.raw('create index sales_rarity_idx on sales("rarity");'),
    knex.schema.raw('create index sales_name_idx on sales("name");'),
    knex.schema.raw('create index sales_date_idx on sales("date");'),

    // // all distinct articles
    // knex.schema.raw('create materialized view distinct_articles as \
    //                  select name, internal, uuid, type, rarity, setid, aa, ea \
    //                  from sales \
    //                  group by name, uuid, internal, type, rarity, setid, aa, ea;'),
    //
    // knex.schema.raw('create unique index u_idx on distinct_articles(internal, aa, ea, type);'),
    //
    // // daily history for each article
    // knex.schema.raw('create materialized view daily_article_sales as \
    //                  select name, internal, date, currency, sum(1) as daily_quantity, sum(price) as daily_total \
    //                  from sales \
    //                  group by name, internal, date, currency;'),
    //
    //
    // knex.schema.raw('create unique index u_idx2 on daily_article_sales(name, date, currency);'),
    //
    // // daily history of all articles
    // knex.schema.raw('create materialized view economy_daily_history as \
    //                  select date, rarity, currency, count(1)::int as quantity, sum(price)::int as total, avg(price)::int as avg, min(price) as min, max(price) as max \
    //                  from sales \
    //                  group by currency, date, rarity \
    //                  order by date, currency, rarity;'),
    //
    //
    // knex.schema.raw('create unique index u_idx3 on economy_daily_history(date, rarity, currency);'),


  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([

    // knex.schema.raw('drop materialized view if exists economy_daily_history;'),
    // knex.schema.raw('drop materialized view if exists daily_article_sales;'),
    // knex.schema.raw('drop materialized view if exists distinct_articles;'),

    knex.schema.dropTableIfExists('sales'),

    knex.schema.raw('drop index if exists sales_date_idx;'),
    knex.schema.raw('drop index if exists sales_name_idx;'),
    knex.schema.raw('drop index if exists sales_currency_idx;'),
    knex.schema.raw('drop index if exists sales_rarity_idx;'),

  ]);

};
