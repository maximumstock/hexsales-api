'use strict';

require('co-mocha');
const expect = require('chai').expect;
const app = require('../../../lib');
const request = require('co-supertest').agent(app.listen());


describe('economy', function() {

  describe('GET /economy/histories', function() {

    it('should return history-like stuff', function*() {

      const res = yield request.get('/v1/economy/histories?start=2015-01-01&end=2015-01-03').expect(200).expect('Content-Type', 'application/json; charset=utf-8').end();
      const result = res.body;
      expect(result).to.be.an('object');

      const props = Object.keys(result);
      expect(props.length).to.not.equal(0);
      props.forEach(function(p) {
        expect(result[p]).to.be.an('array');
        result[p].forEach(function(e) {
          expect(e).to.have.a.property('d');
          expect(e).to.have.a.property('c');
          expect(e).to.have.a.property('q');
          expect(e).to.have.a.property('t');
        });
      })

    });

    it('should yield an error if `start` or `end` are invalid date strings', function*() {

      const res = yield request.get('/v1/economy/histories?start=abc').expect(400).expect('Content-Type', 'application/json; charset=utf-8').end();
      const result = res.body;

      expect(result).to.be.an('object');
      expect(result).to.have.a.property('status');
      expect(result.status).to.equal(400);

    });

  });

  describe('GET /economy/mostsold', function() {

    it('should yield an object with data for each currency', function*() {

      const start = '2016-01-01';
      const end = '2016-01-03'
      const limit = 40;

      const res = yield request.get(`/v1/economy/mostsold?start=${start}&end=${end}&limit=${limit}`).expect(200).expect('Content-Type', 'application/json; charset=utf-8').end();
      const result = res.body;
      expect(result).to.be.an('object');

      const currencies = ['platinum', 'gold'];
			
			for(let currency of currencies) {

        expect(result).to.have.a.property(currency);
        expect(result[currency]).to.be.an('array');
        expect(result[currency].length).to.equal(limit);

        const row = result[currency][0];
        expect(row).to.have.a.property('total');
        expect(row).to.have.a.property('quantity');
        expect(row).to.have.a.property('avg');
        expect(row).to.have.a.property('name');

      }

    });

		it('should yield an error if `start` or `end` are invalid', function*() {
		
			const start = 'a';
			const end = 'b';

			const res = yield request.get(`/v1/economy/mostsold?start=${start}&end=${end}`).expect(400).expect('Content-Type', 'application/json; charset=utf-8').end();
			const result = res.body;

			expect(result).to.be.an('object');
			expect(result.status).to.equal(400);
		
		});

		it('should yield an error if `start` and `end` are more than 31 days apart', function*() {
		
			const start = '2016-01-01';
			const end = '2016-03-01';

			const res = yield request.get(`/v1/economy/mostsold?start=${start}&end=${end}`).expect(422).expect('Content-Type', 'application/json; charset=utf-8').end();
			const result = res.body;

			expect(result).to.be.an('object');
			expect(result.status).to.equal(422);
		
		});

  });

});
