'use strict';

require('co-mocha');
const expect = require('chai').expect;
const app = require('../../../lib');
const request = require('co-supertest').agent(app.listen());


describe('sets', function() {

    describe('GET /sets', function() {

        it('should yield an array of sets', function*() {

            const res = yield request.get('/v1/sets').expect(200).expect('Content-Type', 'application/json; charset=utf-8').end();
            const result = res.body;
            expect(result).to.be.an('array');
            expect(result.length).to.not.equal(0);
            result.forEach(function(e) {
                expect(e).to.be.a('string');
            });

        });

    });

});
