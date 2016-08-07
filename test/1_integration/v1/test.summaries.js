'use strict';

require('co-mocha');
const expect = require('chai').expect;
const app = require('../../../lib');
const request = require('co-supertest').agent(app.listen());


describe('summaries', function() {

    describe('GET /summaries', function() {

        it('should return summary-like stuff', function*() {

            const res = yield request.get('/v1/summaries?name=Vampire King&start=2014-01-01&end=2016-01-01').expect(200).expect('Content-Type', 'application/json; charset=utf-8').end();
            const result = res.body;

            expect(result).to.be.an('object');

            const props = Object.keys(result);
            expect(props.length).to.not.equal(0);
            props.forEach(function(p) {
                expect(result[p]).to.have.a.property('avg');
                expect(result[p]).to.have.a.property('min');
                expect(result[p]).to.have.a.property('max');
                expect(result[p]).to.have.a.property('quantity');
                expect(result[p]).to.have.a.property('total');
            })

        });

        it('should yield an error if `start` or `end` are invalid date strings', function*() {

            const res = yield request.get('/v1/summaries?start=abc').expect(400).expect('Content-Type', 'application/json; charset=utf-8').end();
            const result = res.body;

            expect(result).to.be.an('object');
            expect(result).to.have.a.property('status');
            expect(result.status).to.equal(400);

        });

    });

});
