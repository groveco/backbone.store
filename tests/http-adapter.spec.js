import HttpAdapter from '../src/http-adapter'
import sinon from 'sinon'

describe('HTTP adapter', function () {
  let adapter, server
  beforeAll(function () {
    adapter = new HttpAdapter()
  })

  beforeEach(function () {
    server = sinon.fakeServer.create({autoRespond: true})
    server.respondImmediately = true
  })

  afterEach(function () {
    server.restore()
  })

  describe('#buildUrl', function () {
    it('returns the canonical link for a type and id', function () {
      expect(adapter.buildUrl('foo', 2)).toEqual('/foo/2/')
      expect(adapter.buildUrl(4, 2)).toEqual('/4/2/')
      expect(adapter.buildUrl('foo', 0)).toEqual('/foo/0/')
    })

    it('returns the canonical link for a type', function () {
      expect(adapter.buildUrl('foo')).toEqual('/foo/')
      expect(adapter.buildUrl(4)).toEqual('/4/')
    })

    it('returns the canonical link with a prefix', function () {
      let adapter = new HttpAdapter({urlPrefix: '/api'})
      expect(adapter.buildUrl('foo', 2)).toEqual('/api/foo/2/')
      expect(adapter.buildUrl('foo')).toEqual('/api/foo/')
    })
  })

  describe('#get', function () {
    it('returns a parsed resource from the network', function () {
      let payload = {data: {id: 123, attributes: {foo: 'asdf'}}}
      server.respondWith('GET', '/api/user/42/', JSON.stringify(payload))

      return adapter.get('/api/user/42/')
        .then((response) => {
          expect(response).toEqual(payload)
        })
    })

    it('accepts arbitrary query parameters', function () {
      let payload = {data: {id: 123, attributes: {foo: 'asdf'}}}
      server.respondWith('GET', '/api/user/42/?include=bio&foo=bar', JSON.stringify(payload))

      return adapter.get('/api/user/42/', {include: 'bio', foo: 'bar'})
        .then((response) => {
          expect(response).toEqual(payload)
        })
    })

    it('returns a meaningful error message', function () {
      const path = '/api/user/42/'
      const errorCode = 400
      server.respondWith('GET', path, [errorCode, {}, ''])

      return adapter.get(path)
        .catch((err) => {
          expect(err).toBeInstanceOf(Error)
          expect(err.message).toEqual(expect.stringContaining(path))
          expect(err.message).toEqual(expect.stringContaining(`${errorCode}`))
        })
    })
  })

  describe('#create', function () {
    it('creates a new resource on the network', function () {
      let payload = {data: {foo: 'bar', fiz: {biz: 'buz'}}}
      server.respondWith('POST', '/api/user/', JSON.stringify(payload))

      return adapter.create('/api/user/', payload)
        .then((response) => {
          expect(response).toEqual(payload)
        })
    })
  })

  describe('#update', function () {
    it('patches a resource on the network', async function () {
      let payload = {foo: 'bar', fiz: {biz: 'buz'}}
      server.respondWith('PATCH', '/api/user/2/', JSON.stringify(payload))

      return expect(adapter.update('/api/user/2/', payload)).resolves.toEqual(payload)
    })
  })

  describe('#destroy', function () {
    it('deletes a record from the network', function () {
      server.respondWith('DELETE', '/api/user/42/', [204, {}, ''])

      return adapter.destroy('/api/user/42/')
    })
  })
})
