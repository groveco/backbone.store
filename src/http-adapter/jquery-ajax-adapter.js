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

  get (link, query) {
    return super.get(link, query).then(body => JSON.parse(body))
  }

  create (link, payload) {
    return super.create(link, payload)
      .then(body => body && JSON.parse(body))
  }

  update (link, payload) {
    return super.update(link, payload)
      .then(body => JSON.parse(body))
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
  }, isInternal = true) {
    // Stringify data before any async stuff, just in case it's accidentally a mutable object (e.g.
    // some instrumented Vue data)
    if (data && [this.Method.PATCH, this.Method.POST].indexOf(method) > -1) {
      data = JSON.stringify(data)
    }
    return await super._checkSerializeRequests({ url, method, headers, data, isInternal })
  }

  _makeRequest ({ url, method, headers, data, isInternal }) {
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

export default JqueryAjaxHttpAdapter
