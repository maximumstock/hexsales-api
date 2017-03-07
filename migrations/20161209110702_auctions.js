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
            t.integer('plat_bid');
            t.integer('plat_buyout');
            t.integer('gold_bid');
            t.integer('gold_buyout');
            t.string('item');
            t.timestamp('created_at').defaultTo(knex.fn.now());
        }),

        knex.schema.raw('create index auctions_createdat_idx on auctions("created_at");'),
        knex.schema.raw('create index auctions_auctionid_idx on auctions("auction_id");'),
        knex.schema.raw('create index auctions_action_idx on auctions("action");')

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
