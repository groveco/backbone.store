import HttpAdapter from '../src/http-adapter';
import JsonApiParser from '../src/json-api-parser';
import sinon from 'sinon';

describe('HTTP adapter', function () {
  before(function () {
    this.parser = new JsonApiParser();
    this.adapter = new HttpAdapter(this.parser);
  });

  beforeEach(function () {
    this.server = sinon.fakeServer.create({autoRespond: true});
    this.server.respondImmediately = true;
  });

  afterEach(function () {
    this.server.restore();
  });

  describe('#get', function () {
    it('returns a parsed resource from the network', function () {
      let payload = {data: {id: 123, attributes: {foo: 'asdf'}}};
      this.server.respondWith('GET', '/api/user/42/', JSON.stringify(payload));

      return this.adapter.get('/api/user/42/')
        .then((response) => {
          assert.deepEqual(response, payload);
        });
    });

    it('accepts arbitrary query parameters', function () {
      let payload = {data: {id: 123, attributes: {foo: 'asdf'}}};
      this.server.respondWith('GET', '/api/user/42/?include=bio&foo=bar', JSON.stringify(payload));

      return this.adapter.get('/api/user/42/', {include: 'bio', foo: 'bar'})
        .then((response) => {
          assert.deepEqual(response, payload);
        });
    });

    it('returns a meaningful error message', function () {
      const path = '/api/user/42/';
      const errorCode = 400;
      this.server.respondWith('GET', path, [errorCode, {}, '']);

      return this.adapter.get(path)
        .catch((err) => {
          assert.instanceOf(err, Error);
          assert.include(err.message, path);
          assert.include(err.message, errorCode);
        });
    });
  });

  describe('#create', function () {
    it('creates a new resource on the network', function () {
      let payload = {data: {foo: 'bar', fiz: {biz: 'buz'}}};
      this.server.respondWith('POST', '/api/user/', JSON.stringify(payload));

      return this.adapter.create('/api/user/', payload)
        .then((response) => {
          assert.deepEqual(response, payload);
        });
    });
  });

  describe('#update', function () {
    it('patches a resource on the network', function () {
      let payload = {foo: 'bar', fiz: {biz: 'buz'}};
      this.server.respondWith('PATCH', '/api/user/2/', JSON.stringify(payload));

      return this.adapter.update('/api/user/2/', payload)
        .then((response) => {
          assert.deepEqual(response, payload);
        });
    });
  });

  describe('#destroy', function () {
    it('deletes a record from the network', function () {
      this.server.respondWith('DELETE', '/api/user/42/', [204, {}, '']);

      return this.adapter.destroy('/api/user/42/');
    });
  });
});
