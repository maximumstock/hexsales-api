'use strict';

exports.up = function(knex, Promise) {
    return Promise.all([

        /*******************************************************
                            DAILY_SALES TABLE
        *******************************************************/

        knex.schema.createTableIfNotExists('daily_sales', function(t) {
            t.bigIncrements().primary();
            t.charset('utf8');
            // article data
            t.string('uuid');
            t.string('name'); // modified internal string
            t.string('rarity');
            t.string('set');
            t.string('type');
            t.boolean('aa').defaultTo(false);
            // aggregated sale data
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

        knex.schema.raw('create index dailysales_uuid_idx on daily_sales("uuid");'),
        knex.schema.raw('create index dailysales_name_idx on daily_sales("name");'),
        knex.schema.raw('create index dailysales_aa_idx on daily_sales("aa");'),
        knex.schema.raw('create index dailysales_rarity_idx on daily_sales("rarity");'),
        knex.schema.raw('create index dailysales_type_idx on daily_sales("type");'),
        knex.schema.raw('create index dailysales_set_idx on daily_sales("set");'),
        knex.schema.raw('create index dailysales_currency_idx on daily_sales("currency");'),
        knex.schema.raw('create index dailysales_date_idx on daily_sales("date");'),

    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([

        /*******************************************************
                            DAILY_SALES TABLE
        *******************************************************/
        knex.schema.dropTableIfExists('daily_sales'),

    ]);

};
