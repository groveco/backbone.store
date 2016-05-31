import CamelCaseDashConverter from '../camelcase-dash'

describe('camelCase - dash converter', function () {

  before(function () {
    this.converter = new CamelCaseDashConverter();
  });

  it('converts camelCase to dash', function () {
    let str = 'fooBarTest';
    let got = this.converter.decamelize(str);
    let expected = 'foo-bar-test';
    assert.equal(got, expected);
  });

  it('converts dash to camelCase', function () {
    let str = 'foo-bar-test';
    let got = this.converter.camelize(str);
    let expected = 'fooBarTest';
    assert.equal(got, expected);
  });
});