'use strict';

exports.up = function(knex, Promise) {
    return Promise.all([

        /*******************************************************
                            AUCTIONS TABLE
        *******************************************************/

        knex.schema.createTableIfNotExists('auctions', function(t) {
            t.bigIncrements().primary();
            t.charset('utf8');
            t.string('auction_id');
            t.string('actor');
            t.string('action');
            t.string('plat_bid');
            t.string('plat_buyout');
            t.string('gold_bid');
            t.string('gold_buyout');
            t.string('item');
            t.timestamp('created_at').defaultTo(knex.fn.now());
        }),

    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([

        /*******************************************************
                            AUCTIONS TABLE
        *******************************************************/
        knex.schema.dropTableIfExists('auctions'),

    ]);

};
