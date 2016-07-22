/**
 * HttpAdapter
 * @module
 */
import $ from 'jquery'
import _ from 'underscore'
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
    return new RSVP.Promise((resolve, reject) => {
      this._ajax(link, HttpMethods.GET).then(data => {
        resolve(this._parser.parse(data));
      }, () => {
        reject();
      });
    });
  }

  /**
   * Create entity.
   * @param {string} link - Entity url.
   * @param {string} type - Entity type.
   * @param {object} attributes - Data to create entity with.
   * @param {object} relationships - Relationships to create entity with.
   * @returns {Promise} Promise for created data.
   */
  create(link, type,  attributes, relationships = {}) {
    let attributesCopy = _.extend({
      _type: type
    }, attributes, {
      relationships
    });
    return new RSVP.Promise((resolve, reject) => {
      this._ajax(link, HttpMethods.POST, this._parser.serialize({
        data: attributesCopy
      })).then(data => {
        resolve(this._parser.parse(data));
      }, () => {
        reject();
      });
    });
  }

  /**
   * Update entity.
   * @param {string} link - Entity url.
   * @param {string} type - Entity type.
   * @param {object} attributes - Data to update entity with.
   * @param {object} relationships - Relationships to update entity with.
   * @returns {Promise} Promise for updated data.
   */
  update(link, type,  attributes, relationships = {}) {
    let attributesCopy = _.extend({
      _type: type
    }, attributes, {
      relationships
    });
    return new RSVP.Promise((resolve, reject) => {
      this._ajax(link, HttpMethods.PATCH, this._parser.serialize({
        data: attributesCopy
      })).then(data => {
        resolve(this._parser.parse(data));
      }, () => {
        reject();
      });
    });
  }

  /**
   * Destroy entity.
   * @param {string} link - Entity self link.
   * @returns {Promise} Promise for destroy.
   */
  destroy(link) {
    return new RSVP.Promise((resolve, reject) => {
      this._ajax(link, HttpMethods.DELETE).then(() => {
        resolve();
      }, () => {
        reject();
      });
    });
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