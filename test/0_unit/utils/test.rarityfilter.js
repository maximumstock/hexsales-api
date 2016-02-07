'use strict';

var expect = require('chai').expect;
var rarityfilter = require('../../../lib/utils/filter/rarityfilter');

describe('rarityfilter', function() {

    describe('#filter()', function() {
        it('should return the filtered version of an object\'s rarity', function(done) {

            expect(rarityfilter(2)).to.equal('Common');
            expect(rarityfilter(100)).to.equal(100);
            expect(rarityfilter({
                a: 1
            })).to.equal(null);

            done();

        });
    });

});
