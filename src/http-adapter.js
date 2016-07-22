/**
 * HttpAdapter
 * @module
 */
import $ from 'jquery'
import HttpMethods from './http-methods'
import RSVP from 'rsvp'

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
  get(link) {
    return this._ajax(link, HttpMethods.GET).then(data => this._parser.parse(data));
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

    return this._ajax(link, HttpMethods.POST, payload).then(data => this._parser.parse(data));
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

    return this._ajax(link, HttpMethods.PATCH, payload).then(data => this._parser.parse(data));
  }

  /**
   * Destroy entity.
   * @param {string} link - Entity self link.
   * @returns {Promise} Promise for destroy.
   */
  destroy(link) {
    return this._ajax(link, HttpMethods.DELETE)
  }

  _ajax(link, type, data) {
    return new RSVP.Promise((resolve, reject) => {
      let options = {
        url: link,
        type: type,
        headers: {
          Accept: 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json'
        },
        success: data => {
          resolve(data);
        },
        error: () => {
          reject();
        }
      };
      if (data) {
        if ([HttpMethods.POST, HttpMethods.PUT].indexOf(type) > -1) {
          options.data = JSON.stringify(data);
        } else {
          options.data = data;
        }
      }
      $.ajax(options);
    });
  }

}

export default HttpAdapter;
