import JQueryAjaxHttpAdapter from './jquery-ajax-adapter'
import FetchHttpAdapter from './fetch-adapter'

class HttpAdapterFactory {
  static instance (options = {}) {
    if (options.adapter === 'fetch') {
      return new FetchHttpAdapter(options)
    } else {
      return new JQueryAjaxHttpAdapter(options)
    }
  }
}

export default HttpAdapterFactory
