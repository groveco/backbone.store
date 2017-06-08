/**
 * HttpAdapter
 * @module
 */
import {ajax} from 'jquery';
import {Promise} from 'rsvp';

/**
 * Adapter which works with data over HTTP.
 */
class HttpAdapter {
  constructor(options={}) {
    this.urlPrefix = options.urlPrefix;
  }

  buildUrl(type, id) {
    let idPath = `/${id}`;
    let typePath = `/${type}`;
    let path = this.urlPrefix || '';

    path += typePath;

    if (id != null) {
      path += idPath;
    }

    return path + '/';
  }

  /**
   * Get entity by link.
   * @param {string} link - Link to entity.
   * @returns {Promise} Promise for fetched data.
   */
  get(link, query) {
    return this._ajax('GET', link, query)
      .then(body => JSON.parse(body));
  }

  /**
   * Create entity.
   * @param {string} link - Entity url.
   * @param {object} attributes - Data to create entity with.
   * @returns {Promise} Promise for created data.
   */
  create(link, payload) {
    return this._ajax('POST', link, payload)
      .then(body => body && JSON.parse(body));
  }

  /**
   * Update entity.
   * @param {string} link - Entity url.
   * @param {object} attributes - Data to update entity with.
   * @returns {Promise} Promise for updated data.
   */
  update(link, payload) {
    return this._ajax('PATCH', link, payload)
      .then(body => JSON.parse(body));
  }

  /**
   * Destroy entity.
   * @param {string} link - Entity self link.
   * @returns {Promise} Promise for destroy.
   */
  destroy(link) {
    return this._ajax('DELETE', link);
  }

  _ajax(type, url, data) {
    let headers = {
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json'
    };

    if (data && ['PATCH', 'POST'].indexOf(type) > -1) {
      data = JSON.stringify(data);
    }

    return new Promise((resolve, reject) => {
      let request = {
        url,
        type,
        headers,
        success: (data, textStatus, jqXhr) => {
          if (!data && jqXhr.status !== 204) {
            throw new Error(`request returned ${jqXhr.status} status without data`);
          }
          return resolve(data);
        },
        error: (response) => {
          if (response.readyState === 0 || response.status === 0) {
            // this is a canceled request, so we literally should do nothing
            return;
          }

          const error = new Error(`request for resource, ${url}, returned ${response.status} ${response.statusText}`);
          error.response = response;
          reject(error);
        },
        // being explicit about data type so jQuery doesn't "intelligent guess" wrong
        // changing this may not break tests, but does behave badly in prod
        dataType: 'text',
        data
      };

      ajax(request);
    });
  }

}

export default HttpAdapter;
