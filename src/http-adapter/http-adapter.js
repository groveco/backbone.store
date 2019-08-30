/***
 * HttpAdapter
 * @module
 */

/**
 * Adapter which works with data over HTTP, based on the options that
 * are passed to it's constructor. This class is responsible for
 * any CRUD operations that need to be carried out with your {@link https://jsonapi.org/ JSON:API} service
 * from within the Backbone.Store.
 * @param {Object} options -  An object that contains properties:
 * `urlPrefix`,
 * that defines the REST service that will be returning a {@link https://jsonapi.org/ JSON:API} response
 * `defaultHeaders`,
 * a JSON object that contains static headers to be sent with every request
 * `addHeadersBeforeRequest`,
 * a function that returns a JSON object that returns an object of headers to be sent with each request
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
    return this._http(this.Method.GET, link, query)
  }

  /**
   * Create entity.
   * @private
   * @param {string} link - Entity url.
   * @param {object} attributes - Data to create entity with.
   * @returns {Promise} Promise for created data.
   */
  create (link, payload) {
    return this._http(this.Method.POST, link, payload)
  }

  /**
   * Update entity.
   * @private
   * @param {string} link - Entity url.
   * @param {object} attributes - Data to update entity with.
   * @returns {Promise} Promise for updated data.
   */
  update (link, payload) {
    return this._http(this.Method.PATCH, link, payload)
  }

  /**
   * Destroy entity.
   * @private
   * @param {string} link - Entity self link.
   * @returns {Promise} Promise for destroy.
   */
  destroy (link) {
    return this._http(this.Method.DELETE, link)
  }

  /**
   * Make a generic request that requires more options then CRUD methods provided.
   * Does not set default `Accept` or `Content-Type`. This must be provided!
   * @param {string} url - URL where the request is being sent.
   * @param {object} options - any options the user wants to pass to the request.
   * this can contain `method`, `headers`, and `data`
   * @returns {Promise} Promise relating to request.
   */
  request (url, options = {}) {
    options.method = options.method || this.Method.GET
    options.headers = options.headers || {}

    // pass in data, even if none is defined to preverve _http method
    // pass in headers, even if none are defined to override default headers that are set with the _http method
    return this._http(options.method, url, options.data, options.headers, false)
  }

  async _checkSerializeRequests ({ url, method, headers, data, isInternal }) {
    let promise
    if (this.serializeRequests) {
      // Wait for all requests to settle (either with success or rejection) before making request
      const promises = Array.from(this._outstandingRequests).map(promise =>
        promise.catch(() => {})
      )

      promise = Promise.all(promises).then(() =>
        this._makeRequest({ url, method, headers, data, isInternal })
      )
    } else {
      promise = this._makeRequest({ url, method, headers, data, isInternal })
    }

    this._outstandingRequests.add(promise)
    const removeFromOutstandingRequests = () => {
      this._outstandingRequests.delete(promise)
    }
    promise.then(removeFromOutstandingRequests, removeFromOutstandingRequests)

    return await promise
  }

  async _http (method = this.Method.GET, url, data, headers = {
    'Accept': 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json'
  }, isInternal = true) {}

  async _makeRequest ({ url, method, headers, data, isInternal }) {}
}

export default HttpAdapter
