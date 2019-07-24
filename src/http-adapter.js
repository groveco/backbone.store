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
    
    let body = null
    
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
      const promises = Array.from(this._outstandingRequests).map(promise =>
        promise.catch(() => {})
      )
      
      promise = Promise.all(promises).then(() => this._fetch({ url, method, headers, body }))
    } else {
      promise = this._fetch({ url, method, headers, body })
    }

    this._outstandingRequests.add(promise)
    const removeFromOutstandingRequests = () => {
      this._outstandingRequests.delete(promise)
    }
    promise.then(removeFromOutstandingRequests, removeFromOutstandingRequests)

    return await promise
  }

  async _fetch ({method, url, headers, body}) {
    let response = await fetch(url, {
      method,
      url,
      headers,
      ...(body || {})
    })
    switch (response.status) {
      case 200:
      case 201:
      case 202:
      case 203:
      case 205:
      case 206:
        if (response.body == null) {
          throw new Error(
            `request returned ${response.status} status without data`
          )
        }
        return await response.json()
      case 204:
        return {}
      default:
        throw new Error(
          `request for resource, ${url}, returned ${response.status} ${response.statusText}`
        )
    }
  }
}

export default HttpAdapter
