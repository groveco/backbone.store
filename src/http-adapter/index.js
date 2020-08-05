/***
 * HttpAdapter
 * @module
 */

export const HTTP_METHOD = Object.freeze({
  GET: 'GET',
  PATCH: 'PATCH',
  POST: 'POST',
  DELETE: 'DELETE'
})

/**
 * Adapter which works with data over HTTP, based on the options that
 * are passed to it's constructor. This class is responsible for
 * any CRUD operations that need to be carried out with your {@link https://jsonapi.org/ JSON:API} service
 * from within the Backbone.Store.
 * @param {Object} options -  An object that contains a property, `urlPrefix`,
 * that defines the REST service that will be returning a {@link https://jsonapi.org/ JSON:API} response.
 * The Object can also include a defaultHeaders object to be sent with internal requests,
 * or a addHeadersBeforeRequest function for headers that need to be calculated dynamically
 */
export default class HttpAdapter {
  constructor (options = {}) {
    this.urlPrefix = options.urlPrefix
    this.serializeRequests = false
    this._outstandingRequests = new Set()
    this.defaultHeaders = options.headers || {}
    this.addHeadersBeforeRequest = options.addHeadersBeforeRequest || (() => {
      return {}
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

    return `${path}/`
  }

  /**
   * Get entity by link.
   * @private
   * @param {string} link - Link to entity.
   * @returns {Promise} Promise for fetched data.
   */
  async get (link, query) {
    return this._http(HTTP_METHOD.GET, link, query)
  }

  /**
   * Create entity.
   * @private
   * @param {string} link - Entity url.
   * @param {object} attributes - Data to create entity with.
   * @returns {Promise} Promise for created data.
   */
  async create (link, payload) {
    return this._http(HTTP_METHOD.POST, link, payload)
  }

  /**
   * Update entity.
   * @private
   * @param {string} link - Entity url.
   * @param {object} attributes - Data to update entity with.
   * @returns {Promise} Promise for updated data.
   */
  async update (link, payload) {
    return this._http(HTTP_METHOD.PATCH, link, payload)
  }

  /**
   * Destroy entity.
   * @private
   * @param {string} link - Entity self link.
   * @returns {Promise} Promise for destroy.
   */
  async destroy (link) {
    return this._http(HTTP_METHOD.DELETE, link)
  }

  /**
   * Make a generic request that requires more options then CRUD methods provided.
   * Does not set default Accept or Content-Type. This must be provided!
   * @param {string} url - URL where the request is being sent.
   * @param {object} options - any options the user wants to pass to the request.
   * this can contain method, headers, internal, and data
   * @returns {Promise} Promise relating to request.
   */
  async request (
    url,
    options = {}
  ) {
    options.method = options.method || HTTP_METHOD.GET
    options.headers = options.headers || {}
    // set internal to true if this request in intended to go to an interal server to gain the default headers passed into the constructor
    options.internal = options.internal || false

    // pass in data, even if none is defined to preverve _http method
    // pass in headers, even if none are defined to override default headers that are set with the _http method
    return this._http(
      options.method,
      url,
      options.data,
      options.headers,
      options.internal
    )
  }

  /**
   * Check if requestion serialization is turned on. If so, the current request will
   * wait for previous requests to settle. Otherwise, the request will just be executed
   * @param {Object} -  options passed via destructoring, which can contain url,
   * method, headers, data, and isInternal properties
   * @returns {Promise} Promise relating to request resolution.
   */
  async _checkSerializeRequests ({
    url,
    method,
    headers,
    data,
    isInternal
  }) {
    let promise
    if (this.serializeRequests) {
      // Wait for all requests to settle (either with success or rejection) before making request
      const promises = Array.from(this._outstandingRequests).map((promise) =>
        promise.catch(() => { })
      );

      promise = Promise.all(promises).then(() =>
        this._makeRequest({ url, method, headers, data, isInternal })
      );
    } else {
      promise = this._makeRequest({ url, method, headers, data, isInternal });
    }

    this._outstandingRequests.add(promise)
    const removeFromOutstandingRequests = () => {
      this._outstandingRequests.delete(promise)
    };
    promise.then(removeFromOutstandingRequests, removeFromOutstandingRequests);

    return await promise
  }

  /**
   * Executes an http request
   * @param {string} method - the type of method being executed. Can be one of the keys of the HTTP_METHOD Object.
   * @param {String} url - the url of the requwst.
   * @param {Object} [data] - a data payload represented as a key/value pair.
   * @param {string} [headers={'Accept': 'application/vnd.api+json', 'Content-Type': 'application/vnd.api+json'}] - headers to be included with the request
   * @param {string} [isInternal=true] - Whether the request is going to an owned/internal server, in which case header options
   * from the constructor will be added to the requewst
   * @returns {Promise} Promise relating to request resolution.
   */
  async _http (
    method,
    url,
    data,
    headers = {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json'
    },
    isInternal = true
  ) {
    return await this._checkSerializeRequests({
      url,
      method,
      headers,
      data,
      isInternal
    })
  }

  /**
   * The Http request method implemented by the extending class.
   * @param {Object} -  options passed via destructoring, which can contain url,
   * method, headers, data, and isInternal properties
   * @returns {Promise} Promise relating to request resolution.
   */
  async _makeRequest ({
    url,
    method,
    headers,
    data,
    isInternal
  }) {
    // method needs to be implemented by extending class
  }
}
