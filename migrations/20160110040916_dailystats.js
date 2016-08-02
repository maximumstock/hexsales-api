'use strict';

exports.up = function(knex, Promise) {
    return Promise.all([

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
                            DAILY_STATS TABLE
        *******************************************************/
        knex.schema.dropTableIfExists('daily_stats'),

    ]);

};
