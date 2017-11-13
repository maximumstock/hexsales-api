'use strict';

require('co-mocha');
const expect = require('chai').expect;
const app = require('../../../lib');
const request = require('co-supertest').agent(app.listen());


describe('stats', function() {

    describe('GET /stats/pricelist', function() {

        it('should yield summary data for all articles for all currencies for various timespans', function*() {

            const res = yield request.get('/v1/stats/pricelist').expect(200).expect('Content-Type', 'application/json; charset=utf-8').end();
            const result = res.body;

            expect(result).to.be.an('object');
            ['platinum', 'gold'].forEach(function(currency) {
                expect(result).to.have.a.property(currency);
                expect(Object.keys(result[currency])).to.not.equal(0);

                const articleKeys = Object.keys(result[currency]);
                expect(articleKeys.length).to.not.equal(0);

                const timespanKeys = Object.keys(result[currency][articleKeys[0]]);
                const firstArticleTimespan = result[currency][articleKeys[0]][timespanKeys[0]];

                ['a', 't', 'q', 'mi', 'ma'].forEach(function(prop) {
                    expect(firstArticleTimespan).to.have.a.property(prop);
                });

            });

        });

    });

    describe('GET /stats/mostsold', function() {

        it('should yield an object with data for each currency', function*() {

            const start = '2017-08-01';
            const end = '2017-08-10'
            const limit = 40;

            const res = yield request.get(`/v1/stats/mostsold?start=${start}&end=${end}&limit=${limit}`).expect(200).expect('Content-Type', 'application/json; charset=utf-8').end();
            const result = res.body;
            expect(result).to.be.an('object');

            const currencies = ['platinum', 'gold'];

            for (let currency of currencies) {

                expect(result).to.have.a.property(currency);
                expect(result[currency]).to.be.an('array');
                expect(result[currency].length).to.equal(limit);

                const row = result[currency][0];
                expect(row).to.have.a.property('total');
                expect(row).to.have.a.property('quantity');
                expect(row).to.have.a.property('average');
                expect(row).to.have.a.property('name');
                expect(row).to.have.a.property('rarity');
                expect(row).to.have.a.property('set');

            }

        });

        it('should yield an error if `start` or `end` are invalid', function*() {

            const start = 'a';
            const end = 'b';

            const res = yield request.get(`/v1/stats/mostsold?start=${start}&end=${end}`).expect(400).expect('Content-Type', 'application/json; charset=utf-8').end();
            const result = res.body;

            expect(result).to.be.an('object');
            expect(result.status).to.equal(400);

        });

        it('should yield an error if `start` and `end` are more than 31 days apart', function*() {

            const start = '2016-01-01';
            const end = '2016-03-01';

            const res = yield request.get(`/v1/stats/mostsold?start=${start}&end=${end}`).expect(422).expect('Content-Type', 'application/json; charset=utf-8').end();
            const result = res.body;

            expect(result).to.be.an('object');
            expect(result.status).to.equal(422);

        });

    });

});
