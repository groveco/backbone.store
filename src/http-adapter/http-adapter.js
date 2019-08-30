/***
 * HttpAdapter
 * @module
 */
import {ajax} from 'jquery'
/**
 * Adapter which works with data over HTTP, based on the options that
 * are passed to it's constructor. This class is responsible for
 * any CRUD operations that need to be carried out with your {@link https://jsonapi.org/ JSON:API} service
 * from within the Backbone.Store.
 * @param {Object} options -  An object that contains a property, `urlPrefix`,
 * that defines the REST service that will be returning a {@link https://jsonapi.org/ JSON:API} response
 */
class HttpAdapter {
  constructor (options = {}) {
    this.urlPrefix = options.urlPrefix

    this.serializeRequests = false
    this._outstandingRequests = new Set()

    this.defaultHeaders = options.headers || {}
    this.addHeadersBeforeRequest = options.addHeadersBeforeRequest || (() => {
      return {}
    })
    this.Method = Object.freeze({
      GET: `GET`,
      PATCH: `PATCH`,
      POST: `POST`,
      DELETE: `DELETE`
    })
  }

  buildUrl (type, id) {
    let idPath = `/${id}`
    let typePath = `/${type}`
    let path = this.urlPrefix || ''

    path += typePath

    if (id != null) {
      path += idPath
    }

    return path + '/'
  }

  /**
   * Get entity by link.
   * @private
   * @param {string} link - Link to entity.
   * @returns {Promise} Promise for fetched data.
   */
  get (link, query) {
    return this._ajax(this.Method.GET, link, query)
      .then(body => JSON.parse(body))
  }

  /**
   * Create entity.
   * @private
   * @param {string} link - Entity url.
   * @param {object} attributes - Data to create entity with.
   * @returns {Promise} Promise for created data.
   */
  create (link, payload) {
    return this._ajax(this.Method.POST, link, payload)
      .then(body => body && JSON.parse(body))
  }

  /**
   * Update entity.
   * @private
   * @param {string} link - Entity url.
   * @param {object} attributes - Data to update entity with.
   * @returns {Promise} Promise for updated data.
   */
  update (link, payload) {
    return this._ajax(this.Method.PATCH, link, payload)
      .then(body => JSON.parse(body))
  }

  /**
   * Destroy entity.
   * @private
   * @param {string} link - Entity self link.
   * @returns {Promise} Promise for destroy.
   */
  destroy (link) {
    return this._ajax(this.Method.DELETE, link)
  }

  _ajax (type, url, data) {
    let headers = {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json'
    }

    // Stringify data before any async stuff, just in case it's accidentally a mutable object (e.g.
    // some instrumented Vue data)
    if (data && [this.Method.PATCH, this.Method.POST].indexOf(type) > -1) {
      data = JSON.stringify(data)
    }

    let promise
    if (this.serializeRequests) {
      // Wait for all requests to settle (either with success or rejection) before making request
      const promises = Array.from(this._outstandingRequests)
        .map(promise => promise.catch(() => {}))

      promise = Promise.all(promises)
        .then(() => this._makeRequest({ url, type, headers, data }))
    } else {
      promise = this._makeRequest({ url, type, headers, data })
    }

    this._outstandingRequests.add(promise)
    const removeFromOutstandingRequests = () => {
      this._outstandingRequests.delete(promise)
    }
    promise.then(removeFromOutstandingRequests, removeFromOutstandingRequests)

    return promise
  }

  _makeRequest ({ url, type, headers, data }) {
    return new Promise((resolve, reject) => {
      let request = {
        url,
        type,
        headers,
        success: (data, textStatus, jqXhr) => {
          if (!data && jqXhr.status !== 204) {
            throw new Error(`request returned ${jqXhr.status} status without data`)
          }
          return resolve(data)
        },
        error: (response) => {
          if (response.readyState === 0 || response.status === 0) {
            // this is a canceled request, so we literally should do nothing
            return
          }

          const error = new Error(`request for resource, ${url}, returned ${response.status} ${response.statusText}`)
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

export default HttpAdapter
