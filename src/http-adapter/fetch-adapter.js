/***
 * FetchHttpAdapter
 * @module
 */
import HttpAdapter from './http-adapter'
import _ from 'underscore'
/**
 * Adapter which works with data over HTTP via fetch
 */
class FetchHttpAdapter extends HttpAdapter {
  async _http (method = this.Method.GET, url, data, headers = {
    'Accept': 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json'
  }, isInternal = true) {
    // TODO: implement this as a custom error
    if (!url) throw new Error(`url is not defined!`)

    // explicitly set body to undefined. Contrary to MDN documentation, GET methods cannot take a body. Therefore, the default must be undefined
    let body

    // eslint-disable-next-line no-undef
    const requestUrl = new URL(url, location.origin)

    if (method === this.Method.GET && data && _.isObject(data)) {
      // serialize query params
      for (let [key, value] of Object.entries(data)) {
        requestUrl.searchParams.append(key, value)
      }
    } else if (method === this.Method.POST || method === this.Method.PATCH) {
      // Stringify data before any async stuff, just in case it'
      // some instrumented Vue data)
      body = JSON.stringify(data)
    }

    /**
     * Serialize the URL object to get a stringified representation to pass to _makeRequest
     * ex: https://domain.com/prefix/1/2/?item=a&otheritem=b
     */
    url = requestUrl.toString()

    return await super._checkSerializeRequests({ url, method, headers, data: body, isInternal })
  }

  async _makeRequest ({ url, method, headers, data, isInternal }) {
    headers = {
      ...this.defaultHeaders,
      ...this.addHeadersBeforeRequest(),
      ...headers
    }

    // eslint-disable-next-line no-undef
    const response = await fetch(url, {
      method,
      headers,
      body: data
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
      `request for resource, ${url}, returned ${response.status} ${
        response.statusText
      }`
    )
  }
}

export default FetchHttpAdapter
