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
})
