import HttpAdapter from '../src/http-adapter/jquery-ajax-adapter'
import sinon from 'sinon'

describe('HTTP adapter', function () {
  let adapter, server

  beforeEach(function () {
    adapter = new HttpAdapter()
    server = sinon.fakeServer.create({autoRespond: true})
    server.respondImmediately = true
  })

  afterEach(function () {
    server.restore()
  })

  describe('defaultHeaders via  "defaultHeaders" option', () => {
    it('calls "setRequestHeader" on xhr when "defaultHeaders" is set', () => {
      const options = {
        headers: {
          'some-test-header': 'test-header',
          'some-other-header': 'test-other-header'
        }
      }

      adapter = new HttpAdapter(options)
      const mockXhr = {
        setRequestHeader: jest.fn()
      }
      adapter._requestDecorator(mockXhr)

      expect(mockXhr.setRequestHeader).toHaveBeenCalledTimes(2)
      expect(mockXhr.setRequestHeader).toHaveBeenCalledWith('some-test-header', 'test-header')
      expect(mockXhr.setRequestHeader).toHaveBeenCalledWith('some-other-header', 'test-other-header')
    })

    it('Sets headers on request appropriately via blackbox testing', async () => {
      const options = {
        headers: {
          'some-test-header': 'test-header',
          'some-other-header': 'test-other-header'
        }
      }
      adapter = new HttpAdapter(options)

      server.respondWith('GET', '/my-test-url', JSON.stringify({}))

      await adapter._http('GET', '/my-test-url')

      expect(server.requests[0].url).toEqual('/my-test-url')
      expect(server.requests[0].requestHeaders).toMatchObject({'some-test-header': 'test-header'})
      expect(server.requests[0].requestHeaders).toMatchObject({'some-other-header': 'test-other-header'})
    })
  })

  describe('dynamic headers via "addHeadersBeforeRequest()" options', () => {
    it('calls "setRequestHeader" on xhr when "defaultHeaders" is set', () => {
      const options = {
        addHeadersBeforeRequest: jest.fn(() => {
          return {
            'some-test-header': 'test-header',
            'some-other-header': 'test-other-header'
          }
        })
      }

      adapter = new HttpAdapter(options)
      const mockXhr = {
        setRequestHeader: jest.fn()
      }
      adapter._requestDecorator(mockXhr)
      expect(options.addHeadersBeforeRequest).toHaveBeenCalledTimes(1)
      expect(mockXhr.setRequestHeader).toHaveBeenCalledTimes(2)
      expect(mockXhr.setRequestHeader).toHaveBeenCalledWith('some-test-header', 'test-header')
      expect(mockXhr.setRequestHeader).toHaveBeenCalledWith('some-other-header', 'test-other-header')
    })

    it('Sets headers on request appropriately via blackbox testing', async () => {
      const options = {
        addHeadersBeforeRequest: jest.fn(() => {
          return {
            'some-test-header': 'test-header',
            'some-other-header': 'test-other-header'
          }
        })
      }
      adapter = new HttpAdapter(options)

      server.respondWith('GET', '/my-test-url', JSON.stringify({}))

      await adapter._http('GET', '/my-test-url')

      expect(server.requests[0].url).toEqual('/my-test-url')
      expect(server.requests[0].requestHeaders).toMatchObject({'some-test-header': 'test-header'})
      expect(server.requests[0].requestHeaders).toMatchObject({'some-other-header': 'test-other-header'})
    })

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

  describe('#serializeRequests', function () {
    it('parallel requests do not start when `serializeRequests = true`', async function () {
      server.autoRespond = false
      server.respondImmediately = false

      // Turn on `serializeRequests` and then make two parallel requests
      adapter.serializeRequests = true
      adapter.get('/api/user/42/')
      adapter.get('/api/offer/9000/')

      // Tick microtask queue
      await Promise.resolve().then(() => {})

      expect(server.requests).toHaveLength(1)
      expect(server.requests[0].url).toEqual('/api/user/42/')
    })

    it('parallel requests do not start when `serializeRequests = true`, even if it was set after the pending request started', async function () {
      server.autoRespond = false
      server.respondImmediately = false

      // Turn on `serializeRequests` after making the first request
      adapter.get('/api/user/42/')
      adapter.serializeRequests = true
      adapter.get('/api/offer/9000/')

      // Tick microtask queue
      await Promise.resolve().then(() => {})

      expect(server.requests).toHaveLength(1)
      expect(server.requests[0].url).toEqual('/api/user/42/')
    })

    it('sequential requests start after previous finishes when `serializeRequests = true`', async function () {
      server.autoRespond = false
      server.respondImmediately = false

      // Turn on `serializeRequests` and make some requests
      adapter.serializeRequests = true
      const fetch1 = adapter.get('/api/user/42/')
      const fetch2 = adapter.get('/api/offer/9000/')

      // Tick microtask queue
      await Promise.resolve().then(() => {})

      expect(server.requests).toHaveLength(1)
      expect(server.requests[0].url).toEqual('/api/user/42/')

      const payload = {foo: 'bar', fiz: {biz: 'buz'}}
      server.requests[0].respond(200, { "Content-Type": "application/json" }, JSON.stringify(payload))

      await fetch1

      // Tick microtask queue
      await Promise.resolve().then(() => {})

      expect(server.requests).toHaveLength(2)
      expect(server.requests[1].url).toEqual('/api/offer/9000/')

      const payload2 = {foo2: 'bar', fiz2: {biz: 'buz'}}
      server.requests[1].respond(200, { "Content-Type": "application/json" }, JSON.stringify(payload2))

      await fetch2
    })

    it('parallel requests are restored after `serializeRequests` is toggled back', async function () {
      server.autoRespond = false
      server.respondImmediately = false

      // Turn on `serializeRequests` and make some requests
      adapter.serializeRequests = true
      const fetch1 = adapter.get('/api/user/42/')
      const fetch2 = adapter.get('/api/offer/9000/')

      // Respond to requests
      await Promise.resolve().then(() => {})
      const payload = {foo: 'bar', fiz: {biz: 'buz'}}
      server.requests[0].respond(200, { "Content-Type": "application/json" }, JSON.stringify(payload))
      await fetch1

      await Promise.resolve().then(() => {})
      const payload2 = {foo2: 'bar', fiz2: {biz: 'buz'}}
      server.requests[1].respond(200, { "Content-Type": "application/json" }, JSON.stringify(payload))
      await fetch2

      // Now try to make requests in parallel
      adapter.serializeRequests = false
      adapter.get('/api/something/42/')
      adapter.get('/api/else/9000/')

      // Tick microtask queue
      await Promise.resolve().then(() => {})

      expect(server.requests).toHaveLength(4)
      expect(server.requests[2].url).toEqual('/api/something/42/')
      expect(server.requests[3].url).toEqual('/api/else/9000/')
    })
  })
})
