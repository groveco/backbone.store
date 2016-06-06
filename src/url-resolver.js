import _ from 'underscore'

class UrlResolver {

  constructor(prefix) {
    this._prefix = prefix;
    this._urls = {};
  }

  /**
   * Get URL root for a model.
   * @param {string} modelName - Name of a model registered in store.
   * @param {string|number} [id] - Model Id.
   * @returns {string} URL root for requested model.
   */
  getUrl(modelName, id) {
    let registeredUrl = this._urls[modelName] || modelName;

    let result;
    if (_.isFunction(registeredUrl)) {
      result = registeredUrl(modelName, id);
    } else {
      result = registeredUrl;
      if (id) {
        result = `${result}/${id}`;
      }
    }
    result += '/';

    if (this._prefix) {
      result = `/${this._prefix}/${result}`
    } else {
      result = `/${result}`
    }

    return result;
  }

  /**
   * Register URL root for a model.
   * @param {string} modelName - Name of a model registered in store.
   * @param {string} url - URL root for the model.
   */
  registerUrl(modelName, url) {
    this._urls[modelName] = url;
  }
}

export default UrlResolver;