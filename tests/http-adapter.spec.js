import HttpAdapter from '../src/http-adapter'
import fetchMock from 'fetch-mock'

describe('HTTP adapter', () => {
  let adapter

  beforeEach(() => {
    adapter = new HttpAdapter()
    fetchMock.reset()
    fetchMock.resetBehavior()
  })

  describe('#buildUrl', () => {
    it('returns the canonical link for a type and id', () => {
      expect(adapter.buildUrl('foo', 2)).toEqual('/foo/2/')
      expect(adapter.buildUrl(4, 2)).toEqual('/4/2/')
      expect(adapter.buildUrl('foo', 0)).toEqual('/foo/0/')
    })

    it('returns the canonical link for a type', () => {
      expect(adapter.buildUrl('foo')).toEqual('/foo/')
      expect(adapter.buildUrl(4)).toEqual('/4/')
    })

    it('returns the canonical link with a prefix', () => {
      let adapter = new HttpAdapter({urlPrefix: '/api'})
      expect(adapter.buildUrl('foo', 2)).toEqual('/api/foo/2/')
      expect(adapter.buildUrl('foo')).toEqual('/api/foo/')
    })
  })

  describe('#get', () => {
    it('returns a parsed resource from the network', async () => {
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
      adapter._makeRequest = jest.fn().mockResolvedValue({})

      // Turn on `serializeRequests` and then make two parallel requests
      adapter.serializeRequests = true
      adapter.get(path1)
      adapter.get(path2)

      // Tick microtask queue
      await Promise.resolve().then(() => {})

      expect(adapter._makeRequest).toHaveBeenCalledTimes(1)
      expect(adapter._makeRequest).toHaveBeenNthCalledWith(1, expect.objectContaining({
        url: expect.stringContaining(path1)
      }))
    })

    it('parallel requests do not start when `serializeRequests = true`, even if it was set after the pending request started', async () => {
      adapter._makeRequest = jest.fn().mockResolvedValue({})

      // Turn on `serializeRequests` after making the first request
      adapter.get(path1)
      adapter.serializeRequests = true
      adapter.get(path2)

      // Tick microtask queue
      await Promise.resolve().then(() => {})

      expect(adapter._makeRequest).toHaveBeenCalledTimes(1)
      expect(adapter._makeRequest).toHaveBeenNthCalledWith(1, expect.objectContaining({
        url: expect.stringContaining(path1)
      }))
    })

    it('sequential requests start after previous finishes when `serializeRequests = true`', async () => {
      adapter._makeRequest = jest.fn().mockResolvedValue({})

      adapter.serializeRequests = true
      const fetch1 = adapter.get(path1)
      const fetch2 = adapter.get(path2)

      // Tick microtask queue
      await Promise.resolve().then(() => {})

      expect(adapter._makeRequest).toHaveBeenCalledTimes(1)
      expect(adapter._makeRequest).toHaveBeenNthCalledWith(1, expect.objectContaining({
        url: expect.stringContaining(path1)
      }))

      await fetch1

      // Tick microtask queue
      await Promise.resolve().then(() => {})

      expect(adapter._makeRequest).toHaveBeenCalledTimes(2)
      expect(adapter._makeRequest).toHaveBeenNthCalledWith(2, expect.objectContaining({
        url: expect.stringContaining(path2)
      }))

      await fetch2
    })

    it('parallel requests are restored after `serializeRequests` is toggled back', async () => {
      adapter._makeRequest = jest.fn().mockResolvedValue({})

      // Turn on `serializeRequests` and make some requests
      adapter.serializeRequests = true
      const fetch1 = adapter.get(path1)
      const fetch2 = adapter.get(path2)

      // Tick microtask queue
      await Promise.resolve().then(() => {})

      expect(adapter._makeRequest).toHaveBeenCalledTimes(1)
      expect(adapter._makeRequest).toHaveBeenNthCalledWith(1, expect.objectContaining({
        url: expect.stringContaining(path1)
      }))

      await fetch1

      // Tick microtask queue
      await Promise.resolve().then(() => {})

      expect(adapter._makeRequest).toHaveBeenCalledTimes(2)
      expect(adapter._makeRequest).toHaveBeenNthCalledWith(2, expect.objectContaining({
        url: expect.stringContaining(path2)
      }))

      await fetch2

      // Now try to make requests in parallel
      adapter.serializeRequests = false
      adapter.get(path1)
      adapter.get(path2)

      // Tick microtask queue
      await Promise.resolve().then(() => {})

      expect(adapter._makeRequest).toHaveBeenCalledTimes(4)
      expect(adapter._makeRequest).toHaveBeenNthCalledWith(3, expect.objectContaining({
        url: expect.stringContaining(path1)
      }))
      expect(adapter._makeRequest).toHaveBeenNthCalledWith(4, expect.objectContaining({
        url: expect.stringContaining(path2)
      }))
    })
  })
})
