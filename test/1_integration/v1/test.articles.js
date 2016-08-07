'use strict';

require('co-mocha');
const expect = require('chai').expect;
const app = require('../../../lib');
const request = require('co-supertest').agent(app.listen());


describe('articles', function() {

    describe('GET /articles', function() {

        it('should yield an array of articles', function*() {

            const res = yield request.get('/v1/articles').expect(200).expect('Content-Type', 'application/json; charset=utf-8').end();
            const result = res.body;
            expect(result).to.be.an('array');
            expect(result.length).to.not.equal(0);
            result.forEach(function(e) {
                expect(e).to.be.an('object');
                expect(e).to.have.a.property('name');
            });

        });

        it('should support limit', function*() {

            const res = yield request.get('/v1/articles?limit=10').expect(200).expect('Content-Type', 'application/json; charset=utf-8').end();
            const result = res.body;
            expect(result).to.be.an('array');
            expect(result.length).to.equal(10);

        });

        it('should support offset', function*() {

            const res1 = yield request.get('/v1/articles?limit=1&offset=0').expect(200).expect('Content-Type', 'application/json; charset=utf-8').end();
            const res2 = yield request.get('/v1/articles?limit=1&offset=1').expect(200).expect('Content-Type', 'application/json; charset=utf-8').end();

            expect(res1.body[0].name).to.not.equal(res2.body[0].name);

        });

    });

    describe('GET /articles/:name', function() {

        it('should find an article that has the given name', function*() {

            const res = yield request.get('/v1/articles/Vampire King').expect(200).expect('Content-Type', 'application/json; charset=utf-8').end();
            const result = res.body;

            expect(result).to.be.an('object');
            expect(result.name).to.equal('Vampire King');

        });

        it('should throw a 404 error if there is no article with the given name', function*() {

            const res = yield request.get('/v1/articles/Vampire Kinger').expect(404).expect('Content-Type', 'application/json; charset=utf-8').end();
            const result = res.body;

            expect(result).to.be.an('object');
            expect(result).to.have.a.property('status');
            expect(result.status).to.equal(404);

        });

    });

    describe('GET /articles/:name/summaries', function() {

        it('should return summary-like stuff', function*() {

            const res = yield request.get('/v1/articles/Vampire King/summaries').expect(200).expect('Content-Type', 'application/json; charset=utf-8').end();
            const result = res.body;

            expect(result).to.be.an('object');

            const props = Object.keys(result);
            expect(props.length).to.not.equal(0);
            props.forEach(function(p) {
                expect(result[p]).to.have.a.property('avg');
                expect(result[p]).to.have.a.property('median');
                expect(result[p]).to.have.a.property('min');
                expect(result[p]).to.have.a.property('max');
                expect(result[p]).to.have.a.property('quantity');
                expect(result[p]).to.have.a.property('total');
            })

        });

        it('should yield an error if `start` or `end` are invalid date strings', function*() {

            const res = yield request.get('/v1/articles/Vampire King/summaries?start=abc').expect(400).expect('Content-Type', 'application/json; charset=utf-8').end();
            const result = res.body;

            expect(result).to.be.an('object');
            expect(result).to.have.a.property('status');
            expect(result.status).to.equal(400);

        });

    });

    describe('GET /articles/:name/histories', function() {

        it('should return history-like stuff', function*() {

            const res = yield request.get('/v1/articles/Vampire King/histories').expect(200).expect('Content-Type', 'application/json; charset=utf-8').end();
            const result = res.body;

            expect(result).to.be.an('object');

            const props = Object.keys(result);
            expect(props.length).to.not.equal(0);
            props.forEach(function(p) {
                expect(result[p]).to.be.an('array');
                result[p].forEach(function(e) {
                    expect(e).to.have.a.property('d');
                    expect(e).to.have.a.property('a');
                    expect(e).to.have.a.property('m');
                    expect(e).to.have.a.property('mi');
                    expect(e).to.have.a.property('ma');
                    expect(e).to.have.a.property('q');
                    expect(e).to.have.a.property('t');
                });
            })

        });

        it('should yield an error if `start` or `end` are invalid date strings', function*() {

            const res = yield request.get('/v1/articles/Vampire King/histories?start=abc').expect(400).expect('Content-Type', 'application/json; charset=utf-8').end();
            const result = res.body;

            expect(result).to.be.an('object');
            expect(result).to.have.a.property('status');
            expect(result.status).to.equal(400);

        });

    });

    // describe('GET /articles/:name/conversion', function() {
    //
    //   it('should return an array with conversion rates', function*() {
    //
    //     const res = yield request.get('/v1/articles/Vampire King/conversion').expect(200).expect('Content-Type', 'application/json; charset=utf-8').end();
    //     const result = res.body;
    //
    //     expect(result).to.be.an('array');
    //
    //     result.forEach(function(e) {
    //       expect(e).to.be.an('object');
    //       expect(e).to.have.a.property('date');
    //       expect(e).to.have.a.property('gold_per_plat_avg');
    //       expect(e).to.have.a.property('gold_per_plat_median');
    //       expect(e).to.have.a.property('gold_quantity');
    //       expect(e).to.have.a.property('plat_quantity');
    //     });
    //
    //   });
    //
    // });

    describe('POST /articles/search', function() {

        it('should support searching by name', function*() {

            const res = yield request.post('/v1/articles/search').send({
                name: 'Vampire King'
            }).expect(200).expect('Content-Type', 'application/json; charset=utf-8').end();
            const result = res.body;

            expect(result).to.be.an('array');
            expect(result.length).to.equal(1);
            expect(result[0].name).to.equal('Vampire King');

        });

        it('should support searching by rarity', function*() {

            const res = yield request.post('/v1/articles/search').send({
                rarity: 'Epic'
            }).expect(200).expect('Content-Type', 'application/json; charset=utf-8').end();
            const result = res.body;

            expect(result).to.be.an('array');
            result.forEach(function(a) {
                expect(a.rarity).to.equal('Epic');
            });

        });

        it('should support searching by set', function*() {

            const res = yield request.post('/v1/articles/search').send({
                set: 'Shards of Fate'
            }).expect(200).expect('Content-Type', 'application/json; charset=utf-8').end();
            const result = res.body;

            expect(result).to.be.an('array');
            result.forEach(function(a) {
                expect(a.set).to.equal('Shards of Fate');
            });

        });

        it('should support searching by type', function*() {

            const res = yield request.post('/v1/articles/search').send({
                type: 'Card'
            }).expect(200).expect('Content-Type', 'application/json; charset=utf-8').end();
            const result = res.body;

            expect(result).to.be.an('array');
            result.forEach(function(a) {
                expect(a.type).to.equal('Card');
            });

        });

        //    it('should support searching by aa', function*() {
        //
        //      const res = yield request.post('/v1/articles/search').send({aa: true}).expect(200).expect('Content-Type', 'application/json; charset=utf-8').end();
        //      const result = res.body;
        //
        //      expect(result).to.be.an('array');
        //      result.forEach(function(a) {
        //        expect(a.aa).to.equal(true);
        //      });
        //
        //    });

        it('should support searching by uuid', function*() {

            const res = yield request.post('/v1/articles/search').send({
                uuid: '46c02066-29af-4b7d-bbcb-41ba76e8120f'
            }).expect(200).expect('Content-Type', 'application/json; charset=utf-8').end();
            const result = res.body;

            expect(result).to.be.an('array');
            expect(result.length < 2).to.equal(true); // 0 or 1 resulting articles
            result.forEach(function(a) {
                expect(a.uuid).to.equal('46c02066-29af-4b7d-bbcb-41ba76e8120f');
            });

        });

        it('should support limit', function*() {

            const res = yield request.post('/v1/articles/search').send({
                limit: 10,
                contains: true
            }).expect(200).expect('Content-Type', 'application/json; charset=utf-8').end();
            const result = res.body;
            expect(result).to.be.an('array');
            expect(result.length).to.equal(10);

        });

        it('should support offset', function*() {

            const res1 = yield request.post('/v1/articles/search').send({
                limit: 1,
                offset: 0,
                contains: true
            }).expect(200).expect('Content-Type', 'application/json; charset=utf-8').end();
            const res2 = yield request.post('/v1/articles/search').send({
                limit: 1,
                offset: 1,
                contains: true
            }).expect(200).expect('Content-Type', 'application/json; charset=utf-8').end();

            expect(res1.body[0].name).to.not.equal(res2.body[0].name);

        });

    });

});
