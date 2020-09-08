/***
 * @module http-adapter/jquery
 */
import HttpAdapter, { HTTP_METHOD } from '../index'
import { ajax } from 'jquery'

export default class JqueryHttpAdapter extends HttpAdapter {
  /**
   * The Http request method implemented by jQuery adapter class.
   * @param {Object} options - request options to be propagated to the request
   * @param {string} options.url - the url of the request
   * @param {HTTP_METHOD} options.method - the method of the request
   * @param {Object} options.headers - A key/value object of headers to be sent with the request
   * @param {Object} options.data - A key/value payload to be sent with the request. If method is GET, these
   * options will be transformed into query paramters
   * @returns {Promise} Promise relating to request resolution.
   */
  async _makeRequest ({
    url,
    method,
    headers,
    data
  }) {
    // Stringify data before any async stuff, just in case it's accidentally a mutable object (e.g.
    // some instrumented Vue data)
    if (data && [HTTP_METHOD.PATCH, HTTP_METHOD.POST].indexOf(method) > -1) {
      data = JSON.stringify(data)
    }

    const requestInterceptor = this.requestInterceptor
    const responseInterceptor = this.responseInterceptor

    return new Promise((resolve, reject) => {
      let request = {
        url,
        type: method,
        headers,
        beforeSend (xhr, options) {
          requestInterceptor(xhr, options)
        },
        success: async (data, textStatus, jqXhr) => {
          await responseInterceptor(jqXhr, textStatus, data)

          if (!data && jqXhr.status !== 204) {
            throw new Error(`request returned ${jqXhr.status} status without data`)
          }
          return method !== HTTP_METHOD.DELETE ? resolve(JSON.parse(data)) : resolve(data)
        },
        error: async (response) => {
          await responseInterceptor(response)

          if (response.readyState === 0 || response.status === 0) {
            // this is a canceled request, so we literally should do nothing
            return
          }

          const error = new Error(`request for resource, ${url}, returned ${response.status} ${response.statusText}`)
          error.response = response

          reject(error)
        },
        data
      }

      // being explicit about data type so jQuery doesn't "intelligent guess" wrong
      // changing this may not break tests, but does behave badly in prod
      request.dataType = 'text'

      ajax(request)
    })
  }
}
