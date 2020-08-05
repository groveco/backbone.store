/***
 * AxiosHttpAdapter
 * @module
 */
import HttpAdapter, { HTTP_METHOD } from '../index'
import axios from 'axios'

export class AxiosHttpAdapterError extends Error {
  constructor() {
    super()

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AxiosHttpAdapterError)
    }
    this.name = 'AxiosHttpAdapterError'
  }
}

export default class AxiosHttpAdapter extends HttpAdapter {
  async _makeRequest({
    url,
    method,
    headers,
    data,
    isInternal
  }) {
    let response

    try {
      response = await axios({
        url,
        method,
        headers,
        ...axios(method === HTTP_METHOD.GET ? {
          params: data
        } : {
          data
        })
      })

      if( response.status === 200 && response.data == null){
        throw new AxiosHttpAdapterError(
          `request returned ${response.status} status without data`
        )
      }

      return response.data || {}
    } catch (e) {
      throw new AxiosHttpClientError(
        `reuest for resource ${url} failed: ${error.message}`
      )
    }
  }
}
