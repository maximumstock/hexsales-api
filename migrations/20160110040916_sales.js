'use strict';

exports.up = function(knex, Promise) {
    return Promise.all([

        /*******************************************************
                            SALES TABLE
        *******************************************************/

        knex.schema.createTableIfNotExists('sales', function(t) {
            t.bigIncrements().primary();
            t.charset('utf8');
            // article data
            t.string('uuid');
            t.string('name'); // modified internal string
            t.string('rarity');
            t.string('set');
            t.string('type');
            t.boolean('aa').defaultTo(false);
            // sale data
            t.string('currency');
            t.integer('price');
            t.date('date');
        }),

        knex.schema.raw('create index sales_uuid_idx on sales("uuid");'),
        knex.schema.raw('create index sales_name_idx on sales("name");'),
        knex.schema.raw('create index sales_rarity_idx on sales("rarity");'),
        knex.schema.raw('create index sales_type_idx on sales("type");'),
        knex.schema.raw('create index sales_set_idx on sales("set");'),
        knex.schema.raw('create index sales_aa_idx on sales("aa");'),
        knex.schema.raw('create index sales_currency_idx on sales("currency");'),
        knex.schema.raw('create index sales_date_idx on sales("date");'),

    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([

        /*******************************************************
                            SALES TABLE
        *******************************************************/
        knex.schema.dropTableIfExists('sales'),

    ]);

};
