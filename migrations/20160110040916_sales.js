'use strict';

exports.up = function(knex, Promise) {
    return Promise.all([

        knex.schema.createTableIfNotExists('sales', function(t) {
            t.increments().primary();
            // object details
            t.string('name'); // actual name
            t.string('representation'); // internal name from sales files
            t.string('currency');
            t.specificType('shard', 'text[]');
            t.string('rarity');
            t.string('set');
            t.string('set_id');
            t.boolean('aa').defaultTo(false);
            t.boolean('ea').defaultTo(false);
            t.string('type'); // card/pack/equipment/item/...
            t.date('date');
            t.integer('price');
            t.charset('utf8');
        }),

        knex.schema.raw('CREATE INDEX sales_name_idx on sales(name);'),
        knex.schema.raw('CREATE INDEX sales_currency_idx on sales(currency);'),
        knex.schema.raw('CREATE INDEX sales_rarity_idx on sales(rarity);'),
        knex.schema.raw('CREATE INDEX sales_set_idx on sales(set);'),
        knex.schema.raw('CREATE INDEX sales_aa_idx on sales(aa);'),
        knex.schema.raw('CREATE INDEX sales_ea_idx on sales(ea);'),
        knex.schema.raw('CREATE INDEX sales_type_idx on sales(type);'),
        knex.schema.raw('CREATE INDEX sales_date_idx on sales("date");')

    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([

        knex.schema.raw('DROP AGGREGATE IF EXISTS median(NUMERIC);'),
        knex.schema.dropTableIfExists('sales')

    ]);

};
