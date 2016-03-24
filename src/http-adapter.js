/**
 * HttpAdapter
 * @module
 */
import $ from 'jquery'
import {HttpMethods} from './http-methods'
import RSVP from 'rsvp'

/**
 * Adapter which works with data over HTTP.
 */
class HttpAdapter {

  /**
   * Create a HttpAdapter
   * @param {string} url - Base resource url.
   * @param parser - Parser which parses data from specified format to BackboneStore format
   */
  constructor(url, parser) {
    this._parser = parser;
    this._url = url;
  }

  /**
   * Get entity by Id.
   * @param {number|string} id - Entity Id.
   * @returns {Promise} Promise for fetched data.
   */
  getById(id) {
    return new RSVP.Promise((resolve, reject) => {
      this._ajax(id, HttpMethods.GET).then(data => {
        resolve(this._parser.parse(data));
      }, () => {
        reject();
      });
    });
  }

  /**
   * Get entity by link.
   * @param {string} link - Link to entity.
   * @returns {Promise} Promise for fetched data.
   */
  getByLink(link) {
    return new RSVP.Promise((resolve, reject) => {
      this._ajaxByLink(link).then(data => {
        resolve(this._parser.parse(data));
      }, () => {
        reject();
      });
    });
  }

  /**
   * Create entity.
   * @param {object} attributes - Data to create entity with.
   * @returns {Promise} Promise for created data.
   */
  create(attributes) {
    return new RSVP.Promise((resolve, reject) => {
      this._ajax(null, HttpMethods.POST, this._parser.serialize(attributes)).then(data => {
        resolve(this._parser.parse(data));
      }, () => {
        reject();
      });
    });
  }

  /**
   * Update entity.
   * @param {number|string} id - Entity Id.
   * @param {object} attributes - Data to update entity with.
   * @returns {Promise} Promise for updated data.
   */
  update(id, attributes) {
    return new RSVP.Promise((resolve, reject) => {
      this._ajax(id, HttpMethods.PUT, this._parser.serialize(attributes)).then(data => {
        resolve(this._parser.parse(data));
      }, () => {
        reject();
      });
    });
  }

  /**
   * Destroy entity.
   * @param {number|string} id - Entity Id.
   * @returns {Promise} Promise for destroy.
   */
  destroy(id) {
    return new RSVP.Promise((resolve, reject) => {
      this._ajax(id, HttpMethods.DELETE).then(() => {
        resolve();
      }, () => {
        reject();
      });
    });
  }

  _ajax(id, type, data) {
    return new RSVP.Promise((resolve, reject) => {
      let options = {
        url: this._url,
        type: type,
        contentType: 'application/vnd.api+json',
        success: data => {
          resolve(data);
        },
        error: () => {
          reject();
        }
      };
      if (id) {
        options.url += id + '/';
      }
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

  _ajaxByLink(link) {
    return new RSVP.Promise((resolve, reject) => {
      let options = {
        url: link,
        type: HttpMethods.GET,
        contentType: 'application/vnd.api+json',
        success: data => {
          resolve(data);
        },
        error: () => {
          reject();
        }
      };
      $.ajax(options);
    });
  }

}

export {HttpAdapter};