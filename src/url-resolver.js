class UrlResolver {

  constructor() {
    this._urls = {};
  }

  /**
   * Get URL root for a model.
   * @param {string} modelName - Name of a model registered in store.
   * @returns {string} URL root for requested model.
   */
  getUrl(modelName) {
    let registeredUrl = this._urls[modelName];
    return registeredUrl || modelName;
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

let urlResolver = new UrlResolver();

export default urlResolver;