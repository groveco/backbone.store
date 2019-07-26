import HttpAdapter from '../src/http-adapter'
import fetchMock from 'fetch-mock'

describe('HTTP adapter', function () {
  let adapter

  beforeEach(function () {
    adapter = new HttpAdapter()
    fetchMock.reset()
    fetchMock.resetBehavior()
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

  describe('#get', () => {
    it('returns a parsed resource from the network', async done => {
      let payload = {data: {id: 123, attributes: {foo: 'asdf'}}}
      fetchMock.mock(/.*api\/user\/42\//g, payload, {
        method: 'GET'
      })

      const response = await adapter.get('api/user/42/')
      expect(response).toEqual(payload)
      done()
    })

    it('accepts arbitrary query parameters', async done => {
      let payload = {data: {id: 123, attributes: {foo: 'asdf'}}}
      fetchMock.mock(/.*api\/user\/42\/\?include=bio&foo=bar/g, payload, {
        method: 'GET'
      })

      const response = await adapter.get('api/user/42/', {include: 'bio', foo: 'bar'})
      expect(response).toEqual(payload)
      done()
    })

    it('returns a meaningful error message', async done => {
      const path = 'api/user/42/'
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
      done()
    })
  })

  describe('#create', () => {
    it('creates a new resource on the network', async done => {
      let payload = {data: {foo: 'bar', fiz: {biz: 'buz'}}}
      fetchMock.mock(/.*api\/user\//g, payload, {
        method: 'POST'
      })

      const response = await adapter.create('api/user/', payload)
      expect(response).toEqual(payload)
      done()
    })
  })

  describe('#update', function () {
    it('patches a resource on the network', async done => {
      let payload = {foo: 'bar', fiz: {biz: 'buz'}}
      fetchMock.mock(/.*api\/user\/2\//g, payload, {
        method: 'PATCH'
      })

      const response = await adapter.update('api/user/2/', payload)
      expect(response).toEqual(payload)
      done()
    })
  })

  describe('#destroy', function () {
    it('deletes a record from the network', async done => {
      fetchMock.reset()
      fetchMock.mock(/.*api\/user\/42\//g, 204, {
        method: 'DELETE'
      })

      const response = await adapter.destroy('api/user/42/')
      expect(response).toMatchObject({})
      done()
    })
  })

  describe('#serializeRequests', function () {
    const path1 = 'api/user/42/'
    const path2 = 'api/offer/9000/'

    it('parallel requests do not start and start after previous finishes when `serializeRequests = true`', async done => {
      adapter._fetch = jest.fn().mockResolvedValue({})

      // Turn on `serializeRequests` and then make two parallel requests
      adapter.serializeRequests = true
      adapter.get(path1)
      adapter.get(path2)

      // Tick microtask queue	
      await Promise.resolve().then(() => {})

      expect(adapter._fetch.mock.calls.length).toBe(1)
      expect(adapter._fetch.mock.calls[0][0].url.toString().includes(path1)).toBeTruthy()
      done()
    })

    it('parallel requests do not start when `serializeRequests = true`, even if it was set after the pending request started', async done => {
      adapter._fetch = jest.fn().mockResolvedValue({})

      const fetch1 = adapter.get(path1)
      adapter.serializeRequests = true
      const fetch2 = adapter.get(path2)

      // Tick microtask queue	
      await Promise.resolve().then(() => {})

      expect(adapter._fetch.mock.calls.length).toBe(1)
      expect(adapter._fetch.mock.calls[0][0].url.toString().includes(path1)).toBeTruthy()

      await fetch1

      // Tick microtask queue	
      await Promise.resolve().then(() => {})

      expect(adapter._fetch.mock.calls.length).toBe(2)
      expect(adapter._fetch.mock.calls[1][0].url.toString().includes(path2)).toBeTruthy()

      await fetch2
      
      done()
    })

    it('parallel requests are restored after `serializeRequests` is toggled back', async done => {
      adapter._fetch = jest.fn().mockResolvedValue({})

      // Turn on `serializeRequests` and then make two parallel requests
      adapter.serializeRequests = true
      const fetch1 = adapter.get(path1)
      const fetch2 = adapter.get(path2)

      // Tick microtask queue	
      await Promise.resolve().then(() => {})

      expect(adapter._fetch.mock.calls.length).toBe(1)
      expect(adapter._fetch.mock.calls[0][0].url.toString().includes(path1)).toBeTruthy()

      await fetch1

      // Tick microtask queue	
      await Promise.resolve().then(() => {})

      expect(adapter._fetch.mock.calls.length).toBe(2)
      expect(adapter._fetch.mock.calls[1][0].url.toString().includes(path2)).toBeTruthy()

      await fetch2

      adapter.serializeRequests = false
      adapter.get(path1)
      adapter.get(path2)

      // Tick microtask queue	
      await Promise.resolve().then(() => {})

      expect(adapter._fetch.mock.calls.length).toBe(4)
      expect(adapter._fetch.mock.calls[2][0].url.toString().includes(path1)).toBeTruthy()
      expect(adapter._fetch.mock.calls[3][0].url.toString().includes(path2)).toBeTruthy()
      done() 
    })
  })
})
