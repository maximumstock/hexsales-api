'use strict';

var expect = require('chai').expect;
var util = require('../../../lib/utils/utils');
var moment = require('moment');

describe('util', function() {

    describe('#fixTimespan', function() {

        it('should return the fixed version of start and end of a timespan', function(done) {

            var result = util.fixTimespan('2015-01-01', '2015-01-07', '2015-01-05');

            expect(typeof(result.end)).to.equal('string');
            expect(moment().isValid(result.end)).to.equal(true);
            expect(result.end).to.not.equal('2015-01-07');

            done();

        });
    });

});
