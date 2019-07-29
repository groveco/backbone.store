/***
 * HttpAdapter
 * @module
 */

/**
 * Adapter which works with data over HTTP, based on the options that
 * are passed to it's constructor. This class is responsible for
 * any CRUD operations that need to be carried out with your {@link https://jsonapi.org/ JSON:API} service
 * from within the Backbone.Store.
 * @param {Object} options -  An object that contains a property, `urlPrefix`,
 * that defines the REST service that will be returning a {@link https://jsonapi.org/ JSON:API} response
 */
const METHOD = Object.freeze({
  GET: 'GET',
  PATCH: 'PATCH',
  POST: 'POST',
  DELETE: 'DELETE'
})
class HttpAdapter {
  constructor (options = {}) {
    this.urlPrefix = options.urlPrefix
    this.serializeRequests = false
    this._outstandingRequests = new Set()
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
    return this._http(METHOD.GET, link, query)
  }

  /**
   * Create entity.
   * @private
   * @param {string} link - Entity url.
   * @param {object} attributes - Data to create entity with.
   * @returns {Promise} Promise for created data.
   */
  create (link, payload) {
    return this._http(METHOD.POST, link, payload)
  }

  /**
   * Update entity.
   * @private
   * @param {string} link - Entity url.
   * @param {object} attributes - Data to update entity with.
   * @returns {Promise} Promise for updated data.
   */
  update (link, payload) {
    return this._http(METHOD.PATCH, link, payload)
  }

  /**
   * Destroy entity.
   * @private
   * @param {string} link - Entity self link.
   * @returns {Promise} Promise for destroy.
   */
  destroy (link) {
    return this._http(METHOD.DELETE, link)
  }

  async _http (method = METHOD.GET, url = '', data = {}) {
    if (!url) throw new Error('url is not defined!')

    const headers = {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json'
    }

    // explicitly set body to undefined. Contrary to MDN documentation, GET methods cannot take a body. Therefore, the default must be undefined
    let body

    // eslint-disable-next-line no-undef
    url = new URL(url, location.origin)

    if (method === METHOD.GET) {
      // serialize query params
      for (let [key, value] of Object.entries(data)) {
        url.searchParams.append(key, value)
      }
    } else if (method.includes(METHOD.POST) || method.includes(METHOD.PATCH)) {
      // Stringify data before any async stuff, just in case it's accidentally a mutable object (e.g.
      // some instrumented Vue data)
      body = JSON.stringify(data)
    }

    let promise
    if (this.serializeRequests) {
      // Wait for all requests to settle (either with success or rejection) before making request
      const promises = Array.from(this._outstandingRequests)
        .map(promise => promise.catch(() => {}))

      promise = Promise.all(promises)
        .then(() => this._makeRequest({ url, method, headers, body }))
    } else {
      promise = this._makeRequest({ url, method, headers, body })
    }

    this._outstandingRequests.add(promise)
    const removeFromOutstandingRequests = () => {
      this._outstandingRequests.delete(promise)
    }
    promise.then(removeFromOutstandingRequests, removeFromOutstandingRequests)

    return await promise
  }

  async _makeRequest ({method, url, headers, body}) {
    // eslint-disable-next-line no-undef
    let response = await fetch(url, {
      method,
      headers,
      body
    })
    if (response.status < 300 && response.status >= 200) {
      if (response.body == null && response.status !== 204) {
        throw new Error(
          `request returned ${response.status} status without data`
        )
      } else if (response.status === 204) {
        return {}
      }
      return await response.json()
    }
    throw new Error(
      `request for resource, ${url}, returned ${response.status} ${response.statusText}`
    )
  }
}

export default HttpAdapter
