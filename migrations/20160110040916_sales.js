'use strict';

exports.up = function(knex, Promise) {
  return Promise.all([

    knex.schema.createTableIfNotExists('sales', function(t) {
      t.bigIncrements().primary();
      t.charset('utf8');
      // sale related data
      t.string('name');
      t.string('internal');
      t.string('type'); // either 'Card', 'Pack' or 'Equipment' (or maybe something else in the future)
      t.date('date');
      t.integer('price');
      t.string('currency');
      t.string('rarity');


      // article related data
      // these rows are optional and should be used in combination with a valid `type` value
      t.string('setid');
      t.string('slot');
      t.boolean('aa');
      t.boolean('ea');

    }),

    knex.schema.raw('create index sales_internal_idx on sales("internal");'),
    knex.schema.raw('create index sales_type_idx on sales("type");'),
    knex.schema.raw('create index sales_currency_idx on sales("currency");'),
    knex.schema.raw('create index sales_rarity_idx on sales("rarity");'),
    knex.schema.raw('create index sales_name_idx on sales("name");'),
    knex.schema.raw('create index sales_date_idx on sales("date");')

  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([

    knex.schema.dropTableIfExists('sales'),

    knex.schema.raw('drop index sales_date_idx;'),
    knex.schema.raw('drop index sales_internal_idx;'),
    knex.schema.raw('drop index sales_name_idx;'),
    knex.schema.raw('drop index sales_currency_idx;'),
    knex.schema.raw('drop index sales_rarity_idx;'),
    knex.schema.raw('drop index sales_type_idx;')

  ]);

};
