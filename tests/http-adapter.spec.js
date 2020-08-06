import HttpAdapter from '../src/http-adapter'

describe('HttpAdapter', () => {
  let httpAdapter

  beforeEach(() => {
    httpAdapter = new HttpAdapter()
  })

  describe('#buildUrl', () => {
    it('returns the canonical link for a type and id',() => {
      expect(httpAdapter.buildUrl('foo', '2')).toEqual('/foo/2/')
      expect(httpAdapter.buildUrl('4', '2')).toEqual('/4/2/')
      expect(httpAdapter.buildUrl('foo', '0')).toEqual('/foo/0/')
    })

    it('returns the canonical link for a type', () => {
      expect(httpAdapter.buildUrl('foo')).toEqual('/foo/')
      expect(httpAdapter.buildUrl('4')).toEqual('/4/')
    })

    it('returns the canonical link with a prefix', () => {
      let httpAdapter = new HttpAdapter({ urlPrefix: '/api' })
      expect(httpAdapter.buildUrl('foo', '2')).toEqual('/api/foo/2/')
      expect(httpAdapter.buildUrl('foo')).toEqual('/api/foo/')
    })
  })

  describe('#request', () => {
    it('populates defaults', async () => {
      httpAdapter._makeRequest = jest.fn().mockResolvedValue()

      await httpAdapter.request('test-url')

      expect(httpAdapter._makeRequest).toHaveBeenCalledTimes(1)
      expect(httpAdapter._makeRequest).toHaveBeenCalledWith({
        url: 'test-url',
        method: 'GET',
        headers: {},
        data: undefined,
        isInternal: false
      })
    })

    it('populates additional fields when passed', async () => {
      httpAdapter._makeRequest = jest.fn().mockResolvedValue()

      await httpAdapter.request('test-url', {
        method: 'POST',
        headers: {
          'header-1': 'one'
        },
        data: {
          foo: 'bar'
        }
      })

      expect(httpAdapter._makeRequest).toHaveBeenCalledTimes(1)
      expect(httpAdapter._makeRequest).toHaveBeenCalledWith({
        url: 'test-url',
        method: 'POST',
        headers: {
          'header-1': 'one'
        },
        data: {
          foo: 'bar'
        },
        isInternal: false
      })
    })
  })

  describe('#serializeRequests', () => {
    const path1 = 'api/user/42/'
    const path2 = 'api/offer/9000/'

    it('parallel requests are executed only when the previous finishes when serializeRequests = true', async () => {
      // purposely set the mock implementation to NEVER resolve to ensure that requests after request #1 do NOT start
      httpAdapter._makeRequest = jest
        .fn()
        .mockImplementation(() => new Promise(() => {}))

      // Turn on serializeRequests and then make two parallel requests
      httpAdapter.serializeRequests = true
      httpAdapter.get(path1)
      httpAdapter.get(path2)

      // Tick microtask queue
      await new Promise(setTimeout)
      expect(httpAdapter._makeRequest).toHaveBeenCalledTimes(1)
      expect(httpAdapter._makeRequest).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          url: expect.stringContaining(path1)
        })
      )
    })

    it('new request waits until previous has finished when serializeRequests = true, even if it was added after the pending request started', async () => {
      // purposely set the mock implementation to NEVER resolve to ensure that requests after request #1 do NOT start
      httpAdapter._makeRequest = jest
        .fn()
        .mockImplementation(() => new Promise(() => {}))

      // Turn on serializeRequests after making the first request
      httpAdapter.get(path1)
      httpAdapter.serializeRequests = true
      httpAdapter.get(path2)

      // Tick microtask queue
      await new Promise(setTimeout)

      expect(httpAdapter._makeRequest).toHaveBeenCalledTimes(1)
      expect(httpAdapter._makeRequest).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          url: expect.stringContaining(path1)
        })
      )
    })

    it('sequential requests start after previous finishes when serializeRequests = true', async () => {
      const respondToRequest = []

      // Invert control of the promise resolution to the test to control when a network call would resolve
      httpAdapter._makeRequest = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          respondToRequest.push(resolve)
        })
      })

      httpAdapter.serializeRequests = true
      const fetch1 = httpAdapter.get(path1)
      const fetch2 = httpAdapter.get(path2)

      // Tick microtask queue
      await new Promise(setTimeout)

      expect(httpAdapter._makeRequest).toHaveBeenCalledTimes(1)
      expect(httpAdapter._makeRequest).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          url: expect.stringContaining(path1)
        })
      )

      const payload = { foo: 'bar', fiz: { biz: 'buz' } }

      // resolve the first request
      respondToRequest[0](payload)

      await fetch1

      // Tick microtask queue
      await new Promise(setTimeout)

      expect(httpAdapter._makeRequest).toHaveBeenCalledTimes(2)
      expect(httpAdapter._makeRequest).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          url: expect.stringContaining(path2)
        })
      )

      const payload2 = { foo2: 'bar', fiz2: { biz: 'buz' } }

      // resolve the second request
      respondToRequest[1](payload2)

      await fetch2
    })

    it('parallel requests are restored after serializeRequests is toggled back', async () => {
      const respondToRequest = []
      // Invert control of the promise resolution to the test to control when a network call would resolve
      httpAdapter._makeRequest = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          respondToRequest.push(resolve)
        })
      })

      // Turn on serializeRequests and make some requests
      httpAdapter.serializeRequests = true
      const fetch1 = httpAdapter.get(path1)
      const fetch2 = httpAdapter.get(path2)

      // Tick microtask queue
      await new Promise(setTimeout)

      expect(httpAdapter._makeRequest).toHaveBeenCalledTimes(1)
      expect(httpAdapter._makeRequest).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          url: expect.stringContaining(path1)
        })
      )

      // resolve the first request
      respondToRequest[0]()

      await fetch1

      // Tick microtask queue
      await new Promise(setTimeout)

      expect(httpAdapter._makeRequest).toHaveBeenCalledTimes(2)
      expect(httpAdapter._makeRequest).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          url: expect.stringContaining(path2)
        })
      )

      // resolve the second request
      respondToRequest[1]()

      await fetch2

      // Now try to make requests in parallel
      httpAdapter.serializeRequests = false
      httpAdapter.get(path1)
      httpAdapter.get(path2)

      // Tick microtask queue
      await new Promise(setTimeout)

      expect(httpAdapter._makeRequest).toHaveBeenCalledTimes(4)
      expect(httpAdapter._makeRequest).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({
          url: expect.stringContaining(path1)
        })
      )
      expect(httpAdapter._makeRequest).toHaveBeenNthCalledWith(
        4,
        expect.objectContaining({
          url: expect.stringContaining(path2)
        })
      )

      // resolve the fourth and third request for extra validation. They should both exist and the resolve order does not matter
      respondToRequest[3]()
      respondToRequest[2]()
    })
  })
})
