'use strict';

var expect = require('chai').expect;
var setfilter = require('../../../lib/utils/filter/setfilter');

describe('setfilter', function() {

    describe('#filter()', function() {
        it('should return the filtered version of an object\'s set name', function(done) {

            expect(setfilter('001')).to.equal('Shards of Fate');
            expect(setfilter('100')).to.equal('100');
            expect(setfilter({
                a: 1
            })).to.equal(null);

            done();

        });
    });

});
