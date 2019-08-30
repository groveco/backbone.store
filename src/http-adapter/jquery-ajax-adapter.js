/***
 * JqueryAjaxHttpAdapter
 * @module
 */
import HttpAdapter from './http-adapter'
import { ajax, ajaxSetup } from 'jquery'
import _ from 'underscore'
/**
 * Adapter which works with data over HTTP via jquery ajax
 */
class JqueryAjaxHttpAdapter extends HttpAdapter {
  constructor (options = {}) {
    super(options)
    ajaxSetup({
      beforeSend: this._requestDecorator.bind(this)
    })
  }

  _requestDecorator (xhr) {
    // see if any default headers have been added to the adapter
    if (_.isObject(this.defaultHeaders) && !_.isEmpty(this.defaultHeaders)) {
      for (let [key, value] of Object.entries(this.defaultHeaders)) {
        xhr.setRequestHeader(key, value)
      }
    }

    // see if any dynamic headers have been calculated in the "addHeadersBeforeRequest" method
    const dynamicHeaders = this.addHeadersBeforeRequest()
    if (_.isObject(dynamicHeaders) && !_.isEmpty(dynamicHeaders)) {
      for (let [key, value] of Object.entries(dynamicHeaders)) {
        xhr.setRequestHeader(key, value)
      }
    }
  }

  async _http (method = this.Method.GET, url, data, headers = {
    'Accept': 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json'
  }) {
    // Stringify data before any async stuff, just in case it's accidentally a mutable object (e.g.
    // some instrumented Vue data)
    if (data && [this.Method.PATCH, this.Method.POST].indexOf(method) > -1) {
      data = JSON.stringify(data)
    }

    let promise
    if (this.serializeRequests) {
      // Wait for all requests to settle (either with success or rejection) before making request
      const promises = Array.from(this._outstandingRequests).map(promise =>
        promise.catch(() => {})
      )

      promise = Promise.all(promises).then(() =>
        this._makeRequest({ url, method, headers, data })
      )
    } else {
      promise = this._makeRequest({ url, method, headers, data })
    }

    this._outstandingRequests.add(promise)
    const removeFromOutstandingRequests = () => {
      this._outstandingRequests.delete(promise)
    }
    promise.then(removeFromOutstandingRequests, removeFromOutstandingRequests);

    return promise
  }

  _makeRequest ({ url, method, headers, data }) {
    return new Promise((resolve, reject) => {
      let request = {
        url,
        type: method,
        headers,
        success: (data, textStatus, jqXhr) => {
          if (!data && jqXhr.status !== 204) {
            throw new Error(
              `request returned ${jqXhr.status} status without data`
            )
          }
          return resolve(data)
        },
        error: response => {
          if (response.readyState === 0 || response.status === 0) {
            // this is a canceled request, so we literally should do nothing
            return
          }

          const error = new Error(
            `request for resource, ${url}, returned ${response.status} ${response.statusText}`
          )
          error.response = response
          reject(error)
        },
        // being explicit about data type so jQuery doesn't "intelligent guess" wrong
        // changing this may not break tests, but does behave badly in prod
        dataType: 'text',
        data
      }

      ajax(request)
    })
  }
}

export default JqueryAjaxHttpAdapter
