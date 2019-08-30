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

  _ajax (type, url, data) {}
}

export default HttpAdapter
