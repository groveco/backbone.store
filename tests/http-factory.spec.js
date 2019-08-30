import HttpAdapterFactory from '../src/http-adapter'
import HttpAdapter from '../src/http-adapter/http-adapter'
import FetchHttpAdapter from '../src/http-adapter/fetch-adapter'
import JQueryAjaxHttpAdapter from '../src/http-adapter/jquery-ajax-adapter'

describe('HTTP Adapter Factory', () => {
  it('returns jQueryAjaxHttpAdapter instance when no options are passed', () => {
    const adapter = HttpAdapterFactory.instance()
    expect(adapter).toBeInstanceOf(JQueryAjaxHttpAdapter)
    expect(adapter).toBeInstanceOf(HttpAdapter)
  })
  it('returns FetchHttpAdapter instance when "option.adapter" is equal to "fetch"', () => {
    const adapter = HttpAdapterFactory.instance({
      adapter: 'fetch'
    })
    expect(adapter).toBeInstanceOf(FetchHttpAdapter)
    expect(adapter).toBeInstanceOf(HttpAdapter)
  })
})
