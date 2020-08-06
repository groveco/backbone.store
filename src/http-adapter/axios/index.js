/***
 * AxiosHttpAdapter
 * @module
 */
import HttpAdapter, { HTTP_METHOD } from '../index'
import axios from 'axios'

export class AxiosHttpAdapterError extends Error {
  constructor (message) {
    super(message)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AxiosHttpAdapterError)
    }
    this.name = 'AxiosHttpAdapterError'
  }
}

export default class AxiosHttpAdapter extends HttpAdapter {
  async _makeRequest ({
    url,
    method,
    headers,
    data,
    isInternal
  }) {
    let response
    let axiosConfig = {
      url,
      method,
      headers,
      ...(method === HTTP_METHOD.GET ? {
        params: data
      } : {
        data
      })
    }

    const responseInterceptor = this.responseInterceptor
    try {
      if (isInternal) {
        axiosConfig = this.requestInterceptor(axiosConfig) || axiosConfig
      }

      response = await axios(axiosConfig)

      if (isInternal) {
        responseInterceptor(response)
      }

      if (response.status === 200 && response.data == null) {
        throw new AxiosHttpAdapterError(
          `request returned ${response.status} status without data`
        )
      }

      return response.data || {}
    } catch (error) {
      if (isInternal) {
        responseInterceptor(error.response)
      }
      throw new AxiosHttpAdapterError(
        `request for resource ${url} failed: ${error.message}`
      )
    }
  }
}
