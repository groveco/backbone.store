import {camelize, decamelize} from '../src/camelcase-dash';

describe('camelCase - dash converter', function () {
  describe('decamelize', function () {
    it('converts camelCase to dash', function () {
      expect(decamelize('fooBarTest')).toEqual('foo-bar-test');
    });

    it('supports numbers', function () {
      expect(decamelize('fo1BarTest')).toEqual('fo1-bar-test');
      expect(decamelize('fo12arTest')).toEqual('fo12ar-test');
    });
  });

  describe('camelize', function () {
    it('converts dash to camelCase', function () {
      expect(camelize('foo-bar-test')).toEqual('fooBarTest');
    });

    it('supports numbers', function () {
      expect(camelize('fo1-bar-test')).toEqual('fo1BarTest');
      expect(camelize('fo12ar-test')).toEqual('fo12arTest');
    });
  });
});
