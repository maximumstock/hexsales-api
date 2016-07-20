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

});
