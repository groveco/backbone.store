import HttpAdapter from '../src/http-adapter/http-adapter'

describe('HTTP adapter', function () {
  let adapter

  beforeEach(function () {
    adapter = new HttpAdapter()
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

  describe('#request', function () {
    it('populates defaults', async () => {
      adapter._http = jest.fn()

      await adapter.request('test-url')

      expect(adapter._http).toHaveBeenCalledTimes(1)
      expect(adapter._http).toHaveBeenCalledWith('GET', 'test-url', undefined, {}, false)
    })

    it('populates additional fields when passed', async () => {
      adapter._http = jest.fn()

      await adapter.request('test-url', {
        method: 'POST',
        headers: {
          'header-1': 'one'
        },
        data: {
          'header-1': 'one'
        }
      })

      expect(adapter._http).toHaveBeenCalledTimes(1)
      expect(adapter._http).toHaveBeenCalledWith('POST', 'test-url', {
        'header-1': 'one'
      }, {
        'header-1': 'one'
      }, false)
    })
  })
})
