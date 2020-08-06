import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import { HTTP_METHOD } from '../src/http-adapter'
import AxiosHttpAdapter, { AxiosHttpAdapterError } from '../src/http-adapter/axios'

describe('Axios HTTP Client', () => {
  let axiosHttpAdapter
  let axiosMockAdapter

  beforeEach(() => {
    axiosHttpAdapter = new AxiosHttpAdapter()
    axiosMockAdapter = new AxiosMockAdapter(axios)
  })

  it('Sets headers on request appropriately via blackbox testing', async () => {
    const options = {
      urlPrefix: 'http://my.testapi.co/api',
      headers: {
        'some-test-header': 'test-header',
        'some-other-header': 'test-other-header'
      }
    }

    axiosHttpAdapter = new AxiosHttpAdapter(options)

    axiosMockAdapter.onGet(/.*/g).reply(200, {})

    await axiosHttpAdapter.get('/my-test-url')

    expect(axiosMockAdapter.history.get.length).toBe(1)

    const lastRequest = axiosMockAdapter.history.get[0]
    expect(lastRequest.url).toContain('/my-test-url')
    expect(lastRequest.headers).toEqual(expect.objectContaining({
      'some-test-header': 'test-header'
    }))
    expect(lastRequest.headers).toEqual(expect.objectContaining({
      'some-other-header': 'test-other-header'
    }))
  })

  describe('dynamic options via "requestInterceptor" options', () => {
    it('Sets headers on request appropriately via blackbox testing', async () => {
      const options = {
        urlPrefix: 'http://my.testapi.co/api',
        requestInterceptor: jest.fn((config) => {
          debugger
          return {
            ...config,
            headers: {
              ...config.headers,
              'some-test-header': 'test-header',
              'some-other-header': 'test-other-header'
            }
          }
        })
      }

      axiosHttpAdapter = new AxiosHttpAdapter(options)

      axiosMockAdapter.onGet(/.*/g).reply(200, {})

      await axiosHttpAdapter._http(HTTP_METHOD.GET, '/my-test-url')

      expect(axiosMockAdapter.history.get.length).toBe(1)

      const lastRequest = axiosMockAdapter.history.get[0]
      expect(lastRequest.url).toContain('/my-test-url')
      expect(lastRequest.headers).toEqual(expect.objectContaining({
        'some-test-header': 'test-header'
      }))
      expect(lastRequest.headers).toEqual(expect.objectContaining({
        'some-other-header': 'test-other-header'
      }))
      expect(options.requestInterceptor).toHaveBeenCalledTimes(1)
    })
  })

  describe('#get', function () {
    it('returns a parsed resource from the network', async function () {
      let payload = { id: 123, attributes: { foo: 'asdf' } }

      axiosMockAdapter.onGet(/.*api\/user\/42\//g).reply(200, {
        ...payload
      })

      const response = await axiosHttpAdapter.get('api/user/42/')
      expect(response).toEqual(payload)
    })

    it('accepts arbitrary query parameters', async () => {
      let payload = { id: 123, attributes: { foo: 'asdf' } }

      axiosMockAdapter
        .onGet('api/user/42/', { params: { include: 'bio', foo: 'bar' } })
        .reply(200, {
          ...payload
        })
      const response = await axiosHttpAdapter.get('api/user/42/', {
        include: 'bio',
        foo: 'bar'
      })
      expect(response).toEqual(payload)
    })

    it('returns a meaningful error message', async () => {
      const path = '/api/user/42/'
      const errorCode = 400

      axiosMockAdapter.onGet(path).reply(errorCode)

      try {
        await axiosHttpAdapter.get(path)
      } catch (err) {
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toEqual(expect.stringContaining(path))
        expect(err.message).toEqual(expect.stringContaining(`${errorCode}`))
      }
    })
  })

  describe('#create', () => {
    it('creates a new resource on the network', async () => {
      let payload = { foo: 'bar', fiz: { biz: 'buz' } }

      axiosMockAdapter.onPost(/.*api\/user\//g).reply(200, {
        ...payload
      })

      const response = await axiosHttpAdapter.create('api/user/', payload)
      expect(response).toEqual(payload)
    })
  })

  describe('#update', () => {
    it('patches a resource on the network', async () => {
      let payload = { foo: 'bar', fiz: { biz: 'buz' } }

      axiosMockAdapter.onPatch(/.*api\/user\//g).reply(200, {
        ...payload
      })

      const response = await axiosHttpAdapter.update('api/user/2/', payload)
      expect(response).toEqual(payload)
    })
  })

  describe('#destroy', () => {
    it('deletes a record from the network', async () => {
      axiosMockAdapter.onDelete(/.*api\/user\//g).reply(204)

      const response = await axiosHttpAdapter.destroy('api/user/42/')
      expect(response).toMatchObject({})
    })
  })

  describe('Axios HttpClient Error', () => {
    it('throws instance of AxiosHttpAdapterError when an bad URL parameter is passed', () => {
      expect(axiosHttpAdapter.request('')).rejects.toThrow(
        new AxiosHttpAdapterError(`url is not defined!`)
      )
    })

    it('throws instance of AxiosHttpAdapterError when a request fails', () => {
      axiosMockAdapter.onGet(/.*/g).reply(503)

      expect(axiosHttpAdapter.request('test')).rejects.toThrow(
        new AxiosHttpAdapterError(
          `request for resource 'test' failed: Request failed with status code 503.`
        )
      )
    })

    it('throws instance of AxiosHttpAdapterError when a request is succeeds, but returns an empty body and is NOT a 204', () => {
      axiosMockAdapter.onGet(/.*/g).reply(200, undefined)

      expect(axiosHttpAdapter.request('test')).rejects.toThrow(
        new AxiosHttpAdapterError(
          `request for resource 'test' failed: request returned 200 status without data.`
        )
      )
    })
  })
})