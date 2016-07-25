import {camelize, decamelize} from '../src/camelcase-dash';

describe('camelCase - dash converter', function () {
  describe('decamelize', function () {
    it('converts camelCase to dash', function () {
      assert.equal(decamelize('fooBarTest'), 'foo-bar-test');
    });

    it('supports numbers', function () {
      assert.equal(decamelize('fo1BarTest'), 'fo1-bar-test');
      assert.equal(decamelize('fo12arTest'), 'fo12ar-test');
    });
  });

  describe('camelize', function () {
    it('converts dash to camelCase', function () {
      assert.equal(camelize('foo-bar-test'), 'fooBarTest');
    });

    it('supports numbers', function () {
      assert.equal(camelize('fo1-bar-test'), 'fo1BarTest');
      assert.equal(camelize('fo12ar-test'), 'fo12arTest');
    });
  });
});
