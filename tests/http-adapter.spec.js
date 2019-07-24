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
    let fetchAPI
    beforeEach(() => {
      // set the fetch api to an interim state since we will be decorating it to run assertions
      fetchAPI = global.fetch
    })

    afterEach(() => {
      // reset the mock state of fetch after each test
      global.fetch = fetchAPI
    })

    it('parallel requests do not start and start after previous finishes when `serializeRequests = true`', async done => {
      const fetchMocked = fetchMock.sandbox().mock('*', {
        status: 200,
        method: 'GET',
        body: {}
      })
      let numCalled = 0
      
      global.fetch = async function (url, init) {
        const callOrder = numCalled++

        switch (callOrder) {
          case 0:
            expect(url.pathname.includes(path1)).toBe(true)
            expect(adapter._outstandingRequests.size).toEqual(2)
            break
          case 1:
            expect(url.pathname.includes(path2)).toBe(true)
            expect(adapter._outstandingRequests.size).toEqual(1)
            break
        }

        return await fetchMocked(url, init)
      }

      // Turn on `serializeRequests` and then make two parallel requests
      adapter.serializeRequests = true
      adapter.get(path1).then(() => {
        let calls = fetchMocked.calls()
        expect(calls).toHaveLength(1)
        expect(calls[0][0].includes(path1)).toBe(true)
        expect(adapter._outstandingRequests.size).toEqual(1)
      })
      adapter.get(path2).then(() => {
        let calls = fetchMocked.calls()
        expect(calls).toHaveLength(2)
        expect(calls[1][0].includes(path2)).toBe(true)
        expect(adapter._outstandingRequests.size).toEqual(0)
        done()
      })
    })

    it('parallel requests do not start when `serializeRequests = true`, even if it was set after the pending request started', async done => {
      const fetchMocked = fetchMock.sandbox().mock('*', {
        status: 200,
        method: 'GET',
        body: {}
      })
      let numCalled = 0
      
      global.fetch = async function (url, init) {
        const callOrder = numCalled++

        switch (callOrder) {
          case 0:
            expect(url.pathname.includes(path1)).toBe(true)
            //current outstanding requests should be zero since serializeRequests was turned on AFTER the request started
            expect(adapter._outstandingRequests.size).toEqual(0)
            break
          case 1:
            expect(url.pathname.includes(path2)).toBe(true)
            expect(adapter._outstandingRequests.size).toEqual(1)
            break
        }

        return await fetchMocked(url, init)
      }

      // Turn on `serializeRequests` and then make two parallel requests
      
      adapter.get(path1).then(() => {
        let calls = fetchMocked.calls()
        expect(calls).toHaveLength(1)
        expect(calls[0][0].includes(path1)).toBe(true)
        expect(adapter._outstandingRequests.size).toEqual(1)
      })
      adapter.serializeRequests = true
      adapter.get(path2).then(() => {
        let calls = fetchMocked.calls()
        expect(calls).toHaveLength(2)
        expect(calls[1][0].includes(path2)).toBe(true)
        expect(adapter._outstandingRequests.size).toEqual(0)
        done()
      })
    })

    it('parallel requests are restored after `serializeRequests` is toggled back', async done => {
      const fetchMocked = fetchMock.sandbox().mock('*', {
        status: 200,
        method: 'GET',
        body: {}
      })
      let numCalled = 0
      
      global.fetch = async function (url, init) {
        const callOrder = numCalled++

        switch (callOrder) {
          case 0:
            expect(url.pathname.includes(path1)).toBe(true)
            expect(adapter._outstandingRequests.size).toEqual(2)
            break
          case 1:
            expect(url.pathname.includes(path2)).toBe(true)
            expect(adapter._outstandingRequests.size).toEqual(1)
            break
          case 2:
            expect(url.pathname.includes(path1)).toBe(true)
            // expect all requests to be settled right after serialization mode. the queue should be empty
            expect(adapter._outstandingRequests.size).toEqual(0)
            break
          case 3:
            expect(url.pathname.includes(path2)).toBe(true)
              // the request can still be in the queue or could have resolved. either are acceptable
            expect(adapter._outstandingRequests.size === 0 || adapter._outstandingRequests.size === 1).toBe(true)
            break
        }

        return await fetchMocked(url, init)
      }

      const serializeReqFinish = new Promise(resolve => {
        // Turn on `serializeRequests` and then make two parallel requests
        adapter.serializeRequests = true
        adapter.get(path1).then(() => {
          let calls = fetchMocked.calls()
          expect(calls).toHaveLength(1)
          expect(calls[0][0].includes(path1)).toBe(true)
          expect(adapter._outstandingRequests.size).toEqual(1)
        })
        adapter.get(path2).then(() => {
          let calls = fetchMocked.calls()
          expect(calls).toHaveLength(2)
          expect(calls[1][0].includes(path2)).toBe(true)
          expect(adapter._outstandingRequests.size).toEqual(0)
          resolve()
        })
      })

      await serializeReqFinish

      adapter.serializeRequests = false
      adapter.get(path1)
      adapter.get(path2)

      const calls = fetchMocked.calls()
      expect(calls).toHaveLength(4)
      expect(calls[2][0].includes(path1)).toBe(true)
      expect(calls[3][0].includes(path2)).toBe(true)
      done()
    })
  })
})
