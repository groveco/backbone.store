/***
 * @module http-adapter
 */

export const HTTP_METHOD = Object.freeze({
  GET: 'GET',
  PATCH: 'PATCH',
  POST: 'POST',
  DELETE: 'DELETE'
})

/**
 * Adapter which works with data over HTTP, based on the options that
 * are passed to its constructor. This class is responsible for
 * any CRUD operations that need to be carried out with your {@link https://jsonapi.org/ JSON:API} service
 * from within the Backbone.Store.
 */
export default class HttpAdapter {
  /**
   * Create a new instance of the HttpAdapter
   * @param {Object} [options] - HttpAdapter options
   * @param {string} options.urlPrefix - defines the REST service that will be returning a {@link https://jsonapi.org/ JSON:API} response.
   * @param {boolean} [options.serializeRequests=false] - Whether requests need to wait on the previous request to resolve, IE running requests serially.
   * @param {Function} [options.requestInterceptor=(()=>{})] - A method to be executed before each request to manipulate or augment the request. A popular use case
   * of this is to add headers to a request. This function is only invoked when _http `isInternal` option is set to `true`
   * @param {Function} [options.responseInterceptor=(()=>{})]  - A method to be executed on response to manipulate or handle the given response.
   * A use case of this would be to add generic behavior or error reporting for certain status codes.
   */
  constructor (options = {}) {
    this.urlPrefix = options.urlPrefix
    this.serializeRequests = false
    this._outstandingRequests = new Set()
    this.requestInterceptor = options.requestInterceptor || (() => {})
    this.responseInterceptor = options.responseInterceptor || (() => {})
  }

  /**
   * Parses a JSON:API resource to a restful url.
   * @example
   * returns '/animal/cat/1/' when urlPrefix is '/animal'
   * this.buildUrl('cat', '1')
   * @param {string} type - A JSON:API resource type. See https://jsonapi.org/format/#document-resource-objects
   * @param {string} id - A JSON:API resource id. See https://jsonapi.org/format/#document-resource-objects
   * @returns {string} - the built url containing the urlPrefix.
   */
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
   * @param {Object} query - query params for a given request in a key/value pair format
   * @returns {Promise} Promise for fetched data.
   */
  get (link, query) {
    return this._http(HTTP_METHOD.GET, link, query)
  }

  /**
   * Create entity.
   * @private
   * @param {string} link - Entity url.
   * @param {Object} payload - Data to create entity with.
   * @returns {Promise} Promise for created data.
   */
  create (link, payload) {
    return this._http(HTTP_METHOD.POST, link, payload)
  }

  /**
   * Update entity.
   * @private
   * @param {string} link - Entity url.
   * @param {Object} payload - Data to update entity with.
   * @returns {Promise} Promise for updated data.
   */
  update (link, payload) {
    return this._http(HTTP_METHOD.PATCH, link, payload)
  }

  /**
   * Destroy entity.
   * @private
   * @param {string} link - Entity self link.
   * @returns {Promise} Promise for destroy.
   */
  destroy (link) {
    return this._http(HTTP_METHOD.DELETE, link)
  }

  /**
   * Make a generic request that requires more options than CRUD methods provided.
   * Does not set default Accept or Content-Type headers. These must be provided!
   * @param {string} url - URL where the request is being sent.
   * @param {Object} [options={}] - request options to be propagated to _makeRequest
   * @param {string} options.url - the url of the request
   * @param {HTTP_METHOD} options.method - the method of the request
   * @param {Object} options.headers - A key/value object of headers to be sent with the request
   * @param {Object} options.data - A key/value payload to be sent with the request. If method is GET, these
   * options will be transformed into query paramters
   * @param {boolean} options.isInternal - Whether a request is being sent to an internal server
   * or not to invoke request/response interceptors
   * @returns {Promise} Promise relating to request.
   */
  request (
    url,
    options = {}
  ) {
    const optionsWithDefaults = Object.assign({
      method: HTTP_METHOD.GET,
      headers: {},
      // set internal to true if this request in intended to go to an internal server and invoke the interceptors
      internal: false
    }, options)

    // pass in data, even if none is defined to preverve _http method
    // pass in headers, even if none are defined to override default headers that are set with the _http method
    return this._http(
      optionsWithDefaults.method,
      url,
      optionsWithDefaults.data,
      optionsWithDefaults.headers,
      optionsWithDefaults.internal
    )
  }

  /**
   * Check if request serialization is turned on. If so, the current request will
   * wait for previous requests to settle. Otherwise, the request will just be executed
   * @param {Object} options - request options to be propagated to _makeRequest
   * @param {string} options.url - the url of the request
   * @param {HTTP_METHOD} options.method - the method of the request
   * @param {Object} options.headers - A key/value object of headers to be sent with the request
   * @param {Object} options.data - A key/value payload to be sent with the request. If method is GET, these
   * options will be transformed into query paramters
   * @param {boolean} options.isInternal - Whether a request is being sent to an internal server
   * or not to invoke request/response interceptors
   * @returns {Promise} Promise relating to request resolution.
   */
  _checkSerializeRequests ({
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
    };
    promise.then(removeFromOutstandingRequests, removeFromOutstandingRequests);

    return promise
  }

  /**
   * Executes an http request
   * @param {string} method - the type of method being executed. Can be one of the keys of the HTTP_METHOD Object.
   * @param {string} url - the url of the request.
   * @param {Object} [data] - a data payload represented as a key/value pair.
   * @param {Object} [headers={'Accept': 'application/vnd.api+json', 'Content-Type': 'application/vnd.api+json'}] - headers to be included with the request
   * @param {boolean} [isInternal=true] - Whether the request is going to an owned/internal server, in which case default header options
   * from the constructor will be added to the request
   * @returns {Promise} Promise relating to request resolution.
   */
  _http (
    method,
    url,
    data,
    headers = {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json'
    },
    isInternal = true
  ) {
    return this._checkSerializeRequests({
      url,
      method,
      headers,
      data,
      isInternal
    })
  }

  /**
   * The Http request method implemented by the extending class.
   * @param {Object} options - request options to be propagated to the request
   * @param {string} options.url - the url of the request
   * @param {HTTP_METHOD} options.method - the method of the request
   * @param {Object} options.headers - A key/value object of headers to be sent with the request
   * @param {Object} options.data - A key/value payload to be sent with the request. If method is GET, these
   * options will be transformed into query paramters
   * @param {boolean} options.isInternal - Whether a request is being sent to an internal server
   * or not to invoke request/response interceptors
   * @returns {Promise} Promise relating to request resolution.
   */
  async _makeRequest ({
    url,
    method,
    headers,
    data,
    isInternal
  }) {
    throw new Error('_makeRequest is abstract in HttpAdapter and must be implemented by extending class!')
    // method needs to be implemented by extending class
  }
}
