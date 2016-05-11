/**
 * HttpAdapter
 * @module
 */
import $ from 'jquery'
import HttpMethods from './http-methods'
import RSVP from 'rsvp'
import urlResolver from './url-resolver'

/**
 * Adapter which works with data over HTTP.
 */
class HttpAdapter {

  /**
   * Create a HttpAdapter.
   * @param {JsonApiParser} parser - Parser which parses data from specified format to BackboneStore format.
   * @param {string} [prefix] - URL prefix.
   */
  constructor(parser, prefix) {
    this._parser = parser;
    this._prefix = prefix || '';
  }

  /**
   * Get entity by Id.
   * @param {string} modelName - Entity class name.
   * @param {number|string} id - Entity Id.
   * @returns {Promise} Promise for fetched data.
   */
  getById(modelName, id) {
    return new RSVP.Promise((resolve, reject) => {
      this._ajax(urlResolver.getUrl(modelName), id, HttpMethods.GET).then(data => {
        resolve(this._parser.parse(data));
      }, () => {
        reject();
      }).catch(error => {
        console.error(error);
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
      }).catch(error => {
        console.error(error);
      });
    });
  }

  /**
   * Create entity.
   * @param {string} modelName - Entity class name.
   * @param {object} attributes - Data to create entity with.
   * @returns {Promise} Promise for created data.
   */
  create(modelName, attributes) {
    return new RSVP.Promise((resolve, reject) => {
      this._ajax(urlResolver.getUrl(modelName), null, HttpMethods.POST, this._parser.serialize(attributes)).then(data => {
        resolve(this._parser.parse(data));
      }, () => {
        reject();
      }).catch(error => {
        console.error(error);
      });
    });
  }

  /**
   * Update entity.
   * @param {string} modelName - Entity class name.
   * @param {number|string} id - Entity Id.
   * @param {object} attributes - Data to update entity with.
   * @returns {Promise} Promise for updated data.
   */
  update(modelName, id, attributes) {
    return new RSVP.Promise((resolve, reject) => {
      this._ajax(urlResolver.getUrl(modelName), id, HttpMethods.PUT, this._parser.serialize(attributes)).then(data => {
        resolve(this._parser.parse(data));
      }, () => {
        reject();
      }).catch(error => {
        console.error(error);
      });
    });
  }

  /**
   * Destroy entity.
   * @param {string} modelName - Entity class name.
   * @param {number|string} id - Entity Id.
   * @returns {Promise} Promise for destroy.
   */
  destroy(modelName, id) {
    return new RSVP.Promise((resolve, reject) => {
      this._ajax(urlResolver.getUrl(modelName), id, HttpMethods.DELETE).then(() => {
        resolve();
      }, () => {
        reject();
      }).catch(error => {
        console.error(error);
      });
    });
  }

  _ajax(url, id, type, data) {
    return new RSVP.Promise((resolve, reject) => {
      let options = {
        url: this._prefix + url,
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
      if (options.url.substr(options.url.length - 1) != '/') {
        options.url += '/';
      }
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
      $.ajax(options);
    });
  }

}

export default HttpAdapter;