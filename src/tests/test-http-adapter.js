import CamelCaseDashConverter from '../camelcase-dash'
import HttpAdapter from '../http-adapter'
import JsonApiParser from '../json-api-parser'

describe('HTTP adapter', function () {
  before(function () {
    let converter = new CamelCaseDashConverter();
    this.parser = new JsonApiParser(converter);
    this.adapter = new HttpAdapter(this.parser);
  });

  beforeEach(function () {
    this.server = sinon.fakeServer.create({autoRespond: true});
    this.server.respondImmediately = true
  });

  afterEach(function () {
    this.server.restore()
  });

  describe('#get', function () {
    it('returns a parsed resource from the network', function () {
      let payload = {data: {id: 123, attributes: {foo: 'asdf'}}};
      this.server.respondWith('GET', '/api/user/42/', JSON.stringify(payload));

      return this.adapter.get('/api/user/42/')
        .then((response) => {
          assert.deepEqual(response, this.parser.parse(payload))
        });
    });

    it('accepts arbitrary query parameters', function () {
      let payload = {data: {id: 123, attributes: {foo: 'asdf'}}};
      this.server.respondWith('GET', '/api/user/42/?include=bio&foo=bar', JSON.stringify(payload));

      return this.adapter.get('/api/user/42/', {include: 'bio', foo: 'bar'});
    });
  })

  describe('#create', function () {
    it('creates a new resource on the network', function () {
      let payload = {foo: 'bar', fiz: {biz: 'buz'}};
      this.server.respondWith('POST', '/api/user/', (req) => {
        req.respond(200, {}, req.requestBody)
      });

      return this.adapter.create('/api/user/', {foo: 'bar', fiz: {biz: 'buz'}})
        .then((response) => {
          assert.deepEqual(response, this.parser.parse({data: {attributes: payload}}))
        });
    });
  })

  describe('#update', function () {
    it('patches a resource on the network', function () {
      let payload = {foo: 'bar', fiz: {biz: 'buz'}};
      this.server.respondWith('PATCH', '/api/user/2/', (req) => {
        req.respond(200, {}, req.requestBody)
      });

      return this.adapter.update('/api/user/2/', payload)
        .then((response) => {
          assert.deepEqual(response, this.parser.parse({data: {attributes: payload}}))
        });
    });
  })

  describe('#destroy', function () {
    it('deletes a record from the network', function () {
      this.server.respondWith('DELETE', '/api/user/42/', [200, {}, '']);

      return this.adapter.destroy('/api/user/42/')
    });
  })
});
