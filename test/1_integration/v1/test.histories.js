'use strict';

require('co-mocha');
const expect = require('chai').expect;
const app = require('../../../lib');
const request = require('co-supertest').agent(app.listen());


describe('histories', function() {

    describe('GET /histories', function() {

        it('should return history-like stuff', function*() {

            const res = yield request.get('/v1/histories?name=Vampire King&start=2014-01-01&end=2016-01-01').expect(200).expect('Content-Type', 'application/json; charset=utf-8').end();
            const result = res.body;

            expect(result).to.be.an('object');

            const props = Object.keys(result);
            expect(props.length).to.not.equal(0);
            props.forEach(function(p) {
                expect(result[p]).to.be.an('array');
                result[p].forEach(function(e) {
                    expect(e).to.have.a.property('d');
                    expect(e).to.have.a.property('a');
                    expect(e).to.have.a.property('mi');
                    expect(e).to.have.a.property('ma');
                    expect(e).to.have.a.property('q');
                    expect(e).to.have.a.property('t');
                });
            })

        });

        it('should yield an error if `start` or `end` are invalid date strings', function*() {

            const res = yield request.get('/v1/histories?start=abc').expect(400).expect('Content-Type', 'application/json; charset=utf-8').end();
            const result = res.body;

            expect(result).to.be.an('object');
            expect(result).to.have.a.property('status');
            expect(result.status).to.equal(400);

        });

    });

});
