import {camelize, decamelize} from '../camelcase-dash'

describe('camelCase - dash converter', function () {
  describe('decamelize', function () {
    it('converts camelCase to dash', function () {
      let str = 'fooBarTest';
      let got = decamelize(str);
      let expected = 'foo-bar-test';
      assert.equal(got, expected);
    });
  })

  describe('camelize', function () {
    it('converts dash to camelCase', function () {
      let str = 'foo-bar-test';
      let got = camelize(str);
      let expected = 'fooBarTest';
      assert.equal(got, expected);
    });
  })
});
