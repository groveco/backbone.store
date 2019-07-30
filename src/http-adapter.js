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
    const requestUrl = new URL(url, location.origin)

    if (method === METHOD.GET) {
      // serialize query params
      for (let [key, value] of Object.entries(data)) {
        requestUrl.searchParams.append(key, value)
      }
    } else if (method === METHOD.POST || method === METHOD.PATCH) {
      // Stringify data before any async stuff, just in case it'
      // some instrumented Vue data)
      body = JSON.stringify(data)
    }

    /**
     * Serialize the URL object to get a stringified representation to pass to _makeRequest
     * ex: https://domain.com/prefix/1/2/?item=a&otheritem=b
     */
    url = requestUrl.toString()

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

  async _makeRequest ({url, method, headers, body}) {
    // eslint-disable-next-line no-undef
    const response = await fetch(url, {
      method,
      headers,
      body
    })

    if (response.ok) {
      if (response.status === 204) return {}

      const respBodyStringified = await response.text()

      if (!respBodyStringified) {
        throw new Error(
          `request returned ${response.status} status without data`
        )
      }

      return JSON.parse(respBodyStringified)
    }
    throw new Error(
      `request for resource, ${url}, returned ${response.status} ${response.statusText}`
    )
  }
}

export default HttpAdapter
