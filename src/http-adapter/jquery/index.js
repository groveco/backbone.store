/***
 * JqueryHttpAdapter
 * @module
 */
import HttpAdapter, { HTTP_METHOD } from '../index'
import { ajax } from 'jquery'
import _ from 'underscore'

export default class JqueryHttpAdapter extends HttpAdapter {
  constructor (options = {}) {
    super(options)
  }

  _requestDecorator (xhr, options) {
    // see if any default headers have been added to the adapter
    if (_.isObject(this.defaultHeaders) && !_.isEmpty(this.defaultHeaders)) {
      for (let [key, value] of Object.entries(this.defaultHeaders)) {
        xhr.setRequestHeader(key, value)
      }
    }

    // call the request interceptor to edit the request as needed
    this.requestInterceptor(xhr, options)
  }

  async _makeRequest ({
    url,
    method,
    headers,
    data,
    isInternal
  }) {
    // Stringify data before any async stuff, just in case it's accidentally a mutable object (e.g.
    // some instrumented Vue data)
    if (data && [HTTP_METHOD.PATCH, HTTP_METHOD.POST].indexOf(method) > -1) {
      data = JSON.stringify(data)
    }

    const requestDecorator = this._requestDecorator.bind(this)
    const responseInterceptor = this.responseInterceptor

    return new Promise((resolve, reject) => {
      let request = {
        url,
        type: method,
        headers,
        beforeSend (xhr, options) {
          if (isInternal) {
            requestDecorator(xhr, options)
          }
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

      // for methods besides `request` in the base class, we want to turn of intelligent guessing to be safe
      if (isInternal) {
        // being explicit about data type so jQuery doesn't "intelligent guess" wrong
        // changing this may not break tests, but does behave badly in prod
        request.dataType = 'text'
      }

      ajax(request)
    })
  }
}
