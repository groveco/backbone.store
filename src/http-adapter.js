/**
 * HttpAdapter
 * @module
 */
import {ajax} from 'jquery'
import {Promise} from 'rsvp'

/**
 * Adapter which works with data over HTTP.
 */
class HttpAdapter {

  /**
   * Create a HttpAdapter.
   * @param {JsonApiParser} parser - Parser which parses data from specified format to BackboneStore format.
   */
  constructor(parser) {
    this._parser = parser;
  }

  /**
   * Get entity by link.
   * @param {string} link - Link to entity.
   * @returns {Promise} Promise for fetched data.
   */
  get(link, query) {
    return this._ajax('GET', link, query)
      .then(body => JSON.parse(body))
      .then(body => this._parser.parse(body));
  }

  /**
   * Create entity.
   * @param {string} link - Entity url.
   * @param {object} attributes - Data to create entity with.
   * @returns {Promise} Promise for created data.
   */
  create(link, attributes) {
    let payload = this._parser.serialize({
      data: attributes
    })

    return this._ajax('POST', link, payload)
      .then(body => JSON.parse(body))
      .then(body => this._parser.parse(body));
  }

  /**
   * Update entity.
   * @param {string} link - Entity url.
   * @param {object} attributes - Data to update entity with.
   * @returns {Promise} Promise for updated data.
   */
  update(link, attributes) {
    let payload = this._parser.serialize({
      data: attributes
    })

    return this._ajax('PATCH', link, payload)
      .then(body => JSON.parse(body))
      .then(body => this._parser.parse(body));
  }

  /**
   * Destroy entity.
   * @param {string} link - Entity self link.
   * @returns {Promise} Promise for destroy.
   */
  destroy(link) {
    return this._ajax('DELETE', link)
  }

  _ajax(type, url, data, options) {
    let headers = {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json'
    }

    if (data) {
      if (['PATCH', 'POST'].indexOf(type) > -1) {
        data = JSON.stringify(data);
      } else {
        data = data;
      }
    }

    return new Promise((resolve, reject) => {
      let request = {
        url,
        type,
        headers,
        success: (data) => resolve(data),
        error: (err) => reject(err),
        // being explicit about data type so jQuery doesn't "intelligent guess" wrong
        // changing this may not break tests, but does behave badly in prod
        dataType: 'text',
        data
      }

      ajax(request);
    });
  }

}

export default HttpAdapter;
