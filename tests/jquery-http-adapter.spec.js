import JqueryHttpAdapter from '../src/http-adapter/jquery'
import sinon from 'sinon'

describe('JqueryHttpAdapter', () => {
  let adapter, server

  beforeEach(() => {
    adapter = new JqueryHttpAdapter()
    server = sinon.fakeServer.create({autoRespond: true})
    server.respondImmediately = true
  })

  afterEach(() => {
    server.restore()
  })

  describe('dynamic headers via "requestInterceptor" options', () => {
    it('Sets headers on request appropriately via blackbox testing', async () => {
      const options = {
        requestInterceptor: jest.fn((xhr, options) => {
          xhr.setRequestHeader('some-test-header', 'test-header')
          xhr.setRequestHeader('some-other-header', 'test-other-header')
        })
      }

      adapter = new JqueryHttpAdapter(options)

      server.respondWith('GET', '/my-test-url', JSON.stringify({}))

      await adapter._http('GET', '/my-test-url')

      expect(server.requests[0].url).toEqual('/my-test-url')
      expect(server.requests[0].requestHeaders).toMatchObject({'some-test-header': 'test-header'})
      expect(server.requests[0].requestHeaders).toMatchObject({'some-other-header': 'test-other-header'})
    })
  })

  describe('Response interceptor option', () => {
    it('calls "responseInterceptor" on xhr when response is returned successfully', async () => {
      const options = {
        responseInterceptor: jest.fn()
      }

      adapter = new JqueryHttpAdapter(options)

      let payload = {data: {id: 123, attributes: {foo: 'asdf'}}}
      server.respondWith('GET', '/api/user/42/', JSON.stringify(payload))

      await adapter.get('/api/user/42/')
      expect(options.responseInterceptor).toHaveBeenCalledTimes(1)
    })

    it('calls "responseInterceptor" on xhr when response errors', async () => {
      const options = {
        responseInterceptor: jest.fn()
      }

      adapter = new JqueryHttpAdapter(options)

      const path = '/api/user/42/'
      const errorCode = 400
      server.respondWith('GET', path, [errorCode, {}, ''])

      try {
        await adapter.get('/api/user/42/')
      } catch (e) {
        expect(options.responseInterceptor).toHaveBeenCalledTimes(1)
      }
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
