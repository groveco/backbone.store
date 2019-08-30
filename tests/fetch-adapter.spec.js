import FetchHttpAdapter from '../src/http-adapter/fetch-adapter'
import fetchMock from 'fetch-mock'

describe('Fetch HTTP adapter', () => {
  let adapter

  beforeEach(() => {
    adapter = new FetchHttpAdapter()
    fetchMock.reset()
    fetchMock.resetBehavior()
  })

  describe('defaultHeaders via  "defaultHeaders" option', () => {
    it('Sets headers on request appropriately via blackbox testing', async () => {
      const options = {
        headers: {
          'some-test-header': 'test-header',
          'some-other-header': 'test-other-header'
        }
      }
      adapter = new FetchHttpAdapter(options)

      fetchMock.mock(/.*/g, {}, {
        method: 'GET'
      })

      await adapter._http('GET', '/my-test-url')

      const callDetails = fetchMock.lastCall()
      expect(fetchMock.lastUrl()).toContain('/my-test-url')
      expect(callDetails[1].headers).toMatchObject({'some-test-header': 'test-header'})
      expect(callDetails[1].headers).toMatchObject({'some-other-header': 'test-other-header'})
    })
  })

  describe('dynamic headers via "addHeadersBeforeRequest()" options', () => {
    it('Sets headers on request appropriately via blackbox testing', async () => {
      const options = {
        addHeadersBeforeRequest: jest.fn(() => {
          return {
            'some-test-header': 'test-header',
            'some-other-header': 'test-other-header'
          }
        })
      }
      adapter = new FetchHttpAdapter(options)

      fetchMock.mock(/.*/g, {}, {
        method: 'GET'
      })

      await adapter._http('GET', '/my-test-url')

      const callDetails = fetchMock.lastCall()
      expect(fetchMock.lastUrl()).toContain('/my-test-url')
      expect(callDetails[1].headers).toMatchObject({'some-test-header': 'test-header'})
      expect(callDetails[1].headers).toMatchObject({'some-other-header': 'test-other-header'})
      expect(options.addHeadersBeforeRequest).toHaveBeenCalledTimes(1)
    })
  })

  describe('#get', function () {
    it('returns a parsed resource from the network', async function () {
      let payload = {data: {id: 123, attributes: {foo: 'asdf'}}}
      fetchMock.mock(/.*api\/user\/42\//g, payload, {
        method: 'GET'
      })

      const response = await adapter.get('api/user/42/')
      expect(response).toEqual(payload)
    })

    it('accepts arbitrary query parameters', async () => {
      let payload = {data: {id: 123, attributes: {foo: 'asdf'}}}
      fetchMock.mock(/.*api\/user\/42\/\?include=bio&foo=bar/g, payload, {
        method: 'GET'
      })

      const response = await adapter.get('api/user/42/', {include: 'bio', foo: 'bar'})
      expect(response).toEqual(payload)
    })

    it('returns a meaningful error message', async () => {
      const path = '/api/user/42/'
      const errorCode = 400
      fetchMock.mock(/.*api\/user\/42\//g, errorCode, {
        method: 'GET',
        status: errorCode,
        statusText: ''
      })

      try {
        await adapter.get(path)
      } catch (err) {
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toEqual(expect.stringContaining(path))
        expect(err.message).toEqual(expect.stringContaining(`${errorCode}`))
      }
    })
  })

  describe('#create', () => {
    it('creates a new resource on the network', async () => {
      let payload = {data: {foo: 'bar', fiz: {biz: 'buz'}}}
      fetchMock.mock(/.*api\/user\//g, payload, {
        method: 'POST'
      })

      const response = await adapter.create('api/user/', payload)
      expect(response).toEqual(payload)
    })
  })

  describe('#update', () => {
    it('patches a resource on the network', async () => {
      let payload = {foo: 'bar', fiz: {biz: 'buz'}}
      fetchMock.mock(/.*api\/user\/2\//g, payload, {
        method: 'PATCH'
      })

      const response = await adapter.update('api/user/2/', payload)
      expect(response).toEqual(payload)
    })
  })

  describe('#destroy', () => {
    it('deletes a record from the network', async () => {
      fetchMock.mock(/.*api\/user\/42\//g, 204, {
        method: 'DELETE'
      })

      const response = await adapter.destroy('api/user/42/')
      expect(response).toMatchObject({})
    })
  })

  describe('#serializeRequests', () => {
    const path1 = 'api/user/42/'
    const path2 = 'api/offer/9000/'

    it('parallel requests do not start and start after previous finishes when `serializeRequests = true`', async () => {
      // purposely set the mock implementation to NEVER resolve to ensure that requests after request #1 do NOT start
      adapter._makeRequest = jest.fn().mockImplementation(() => new Promise(() => {}))

      // Turn on `serializeRequests` and then make two parallel requests
      adapter.serializeRequests = true
      adapter.get(path1)
      adapter.get(path2)

      // Tick microtask queue
      await new Promise(setImmediate)

      expect(adapter._makeRequest).toHaveBeenCalledTimes(1)
      expect(adapter._makeRequest).toHaveBeenNthCalledWith(1, expect.objectContaining({
        url: expect.stringContaining(path1)
      }))
    })

    it('parallel requests do not start when `serializeRequests = true`, even if it was set after the pending request started', async () => {
      // purposely set the mock implementation to NEVER resolve to ensure that requests after request #1 do NOT start
      adapter._makeRequest = jest.fn().mockImplementation(() => new Promise(() => {}))

      // Turn on `serializeRequests` after making the first request
      adapter.get(path1)
      adapter.serializeRequests = true
      adapter.get(path2)

      // Tick microtask queue
      await new Promise(setImmediate)

      expect(adapter._makeRequest).toHaveBeenCalledTimes(1)
      expect(adapter._makeRequest).toHaveBeenNthCalledWith(1, expect.objectContaining({
        url: expect.stringContaining(path1)
      }))
    })

    it('sequential requests start after previous finishes when `serializeRequests = true`', async () => {
      const respondToRequest = []
      adapter._makeRequest = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          respondToRequest.push(resolve)
        })
      })

      adapter.serializeRequests = true
      const fetch1 = adapter.get(path1)
      const fetch2 = adapter.get(path2)

      // Tick microtask queue
      await new Promise(setImmediate)

      expect(adapter._makeRequest).toHaveBeenCalledTimes(1)
      expect(adapter._makeRequest).toHaveBeenNthCalledWith(1, expect.objectContaining({
        url: expect.stringContaining(path1)
      }))

      const payload = {foo: 'bar', fiz: {biz: 'buz'}}

      // resolve the first request
      respondToRequest[0](payload)

      await fetch1

      // Tick microtask queue
      await new Promise(setImmediate)

      expect(adapter._makeRequest).toHaveBeenCalledTimes(2)
      expect(adapter._makeRequest).toHaveBeenNthCalledWith(2, expect.objectContaining({
        url: expect.stringContaining(path2)
      }))

      const payload2 = {foo2: 'bar', fiz2: {biz: 'buz'}}

      // resolve the second request
      respondToRequest[1](payload2)

      await fetch2
    })

    it('parallel requests are restored after `serializeRequests` is toggled back', async () => {
      const respondToRequest = []
      adapter._makeRequest = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          respondToRequest.push(resolve)
        })
      })

      // Turn on `serializeRequests` and make some requests
      adapter.serializeRequests = true
      const fetch1 = adapter.get(path1)
      const fetch2 = adapter.get(path2)

      // Tick microtask queue
      await new Promise(setImmediate)

      expect(adapter._makeRequest).toHaveBeenCalledTimes(1)
      expect(adapter._makeRequest).toHaveBeenNthCalledWith(1, expect.objectContaining({
        url: expect.stringContaining(path1)
      }))

      // resolve the first request
      respondToRequest[0]()

      await fetch1

      // Tick microtask queue
      await new Promise(setImmediate)

      expect(adapter._makeRequest).toHaveBeenCalledTimes(2)
      expect(adapter._makeRequest).toHaveBeenNthCalledWith(2, expect.objectContaining({
        url: expect.stringContaining(path2)
      }))

      // resolve the second request
      respondToRequest[1]()

      await fetch2

      // Now try to make requests in parallel
      adapter.serializeRequests = false
      adapter.get(path1)
      adapter.get(path2)

      // Tick microtask queue
      await new Promise(setImmediate)

      expect(adapter._makeRequest).toHaveBeenCalledTimes(4)
      expect(adapter._makeRequest).toHaveBeenNthCalledWith(3, expect.objectContaining({
        url: expect.stringContaining(path1)
      }))
      expect(adapter._makeRequest).toHaveBeenNthCalledWith(4, expect.objectContaining({
        url: expect.stringContaining(path2)
      }))

      // resolve the fourth and third request for extra validation. They should both exist and the resolve order does not matter
      respondToRequest[3]()
      respondToRequest[2]()
    })
  })
})
