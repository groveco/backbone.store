/**
 * Store.
 * @module
 */
import _ from 'underscore';
import addRelatedMethods from './add-related-methods'
import Backbone from 'backbone';
import Repository from './repository';
import RSVP from 'rsvp';

let methodsAdded = false;

/**
 * Backbone Store class that manages all repositories.
 */
class Store {

  /**
   * Create Store.
   * @param {HttpAdapter} adapter - Adapter to any data source.
   * @param {UrlResolver} urlResolver - Class which constructs url for given modelName and id.
   */
  constructor(adapter, urlResolver) {
    this._adapter = adapter;
    this._urlResolver = urlResolver;
    this._repository = new Repository();
    this._pending = {};
    this._modelClasses = {};
  }

  static addRelatedMethods(store) {
    if (!methodsAdded) {
      addRelatedMethods(store);
      methodsAdded = true;
    } else {
      throw new Error('Cannot add related methods more than once');
    }
  }

  /**
   * Register repository in Store.
   * @param {string} modelName - model name that is used in relations definitions.
   * @param {Function} modelClass - Model or collection class.
   */
  register(modelName, modelClass) {
    this._modelClasses[modelName] = modelClass;
  }

  /**
   * Get model by Id or link. If model is cached on front-end it will be returned from cache, otherwise it will be
   * fetched.
   * @param {string} modelName - Model name.
   * @param {string|number} id - Model Id.
   * @returns {Promise} Promise for requested model.
   */
  get(modelName, id) {
    return new RSVP.Promise((resolve) => {
      let model = this.pluck(modelName, id);
      if (model) {
        resolve(model);
      } else {
        this.fetch(modelName, id).then((model) => {
          resolve(model);
        });
      }
    });
  }

  /**
   * Fetch model by Id or link from server.
   * @param {string} modelNameOrLink - Model name or link.
   * * @param {string|number} [id] - Model Id.
   * @returns {Promise} Promise for requested model.
   */
  fetch(modelNameOrLink, id) {
    let link;
    let identifier;
    if (id) {
      link = this._urlResolver.getUrl(modelNameOrLink, id);
      identifier = this.identifier(modelNameOrLink, id);
    } else {
      link = modelNameOrLink;
    }
    let promise = new RSVP.Promise((resolve) => {
      let existingPromise;
      if (id) {
        existingPromise = this._pending[identifier];
      }
      if (existingPromise) {
        existingPromise.then(model => {
          resolve(model);
        });
      } else {
        this._adapter.get(link).then(response => {
          let model = this._setModels(response);
          if (id) {
            delete this._pending[identifier];
          }
          resolve(model);
        }, () => {
          resolve(null);
        });
      }
    });
    if (id) {
      this._pending[identifier] = promise;
    }
    return promise;
  }

  /**
   * Get model by Id from front-end cache.
   * @param {string} modelName - Model name.
   * @param {string|number} id - Model Id.
   * @returns {object} Requested model.
   */
  pluck(modelName, id) {
    return this._repository.get(this.identifier(modelName, id));
  }

  /**
   * Get collection by link.
   * @param {string} link - Collection link.
   * @returns {Promise} Promise for requested collection.
   */
  getCollection(link) {
    return new RSVP.Promise((resolve) => {
      this._adapter.get(link).then(response => {
        let collection = this._setModels(response);
        resolve(collection);
      }, () => {
        resolve(null);
      });
    });
  }

  /**
   * Create model.
   * @param {string} link - Url for POST request.
   * @param {object} attributes - Data to create model with.
   * @returns {Promise} Promise for created model.
   */
  create(modelName, attributes = {}) {
    let link = this._urlResolver.getUrl(modelName);
    return new RSVP.Promise((resolve) => {
      this._adapter.create(link, attributes).then(response => {
        let model = this._setModels(response);
        resolve(model);
      }, () => {
        throw new Error('Couldn\'t create entity.');
      });
    });
  }

  /**
   * Create model.
   * @param {Backbone.Model} model - Model to update.
   * @param {object} attributes - Data to update model with.
   * @returns {Promise} Promise for updated model.
   */
  update(model, attributes) {
    let patchAttributes = _.extend({
      id: model.id,
      _type: model.get('_type')
    }, attributes);
    return new RSVP.Promise((resolve) => {
      this._adapter.update(model.get('_self'), patchAttributes).then((response) => {
        let model = this._setModels(response);
        resolve(model);
      }, () => {
        throw new Error('Couldn\'t update entity.');
      });
    });
  }

  /**
   * Destroy model.
   * @param {string} modelName - Model name.
   * @param {string|number} id - Model Id.
   * @returns {Promise} Promise for destroy.
   */
  destroy(modelName, id) {
    let identifier = this.identifier(modelName, id);
    return new RSVP.Promise((resolve) => {
      let model = this._repository.get(identifier);
      if (model) {
        this._adapter.destroy(model.get('_self')).then(() => {
          this._repository.remove(identifier);
          resolve();
        }, () => {
          throw new Error('Couldn\'t destroy entity.');
        });
      } else {
        throw new Error('Model does not exist');
      }
    });
  }

  identifier(modelName, id) {
    return `${modelName}__${id}`;
  }

  _getModelClass(modelName) {
    let modelClass = this._modelClasses[modelName];
    if (!modelClass) {
      throw new Error(`"${modelName}" is not registered.`);
    }
    return modelClass;
  }

  _setModels(response) {
    let data = response.data;
    let entity;
    if (data instanceof Array) {
      if (data.length) {
        let models = data.map(item => {
          let modelClass = this._getModelClass(item._type);
          return new modelClass(item);
        });
        entity = new Backbone.Collection(models);
        models.forEach(model => {
          let id = this.identifier(model.get('_type'), model.id);
          this._repository.set(id, model);
        });
      } else {
        entity = new Backbone.Collection();
      }
    } else {
      let modelClass = this._getModelClass(data._type);
      entity = new modelClass(data);
      let id = this.identifier(entity.get('_type'), entity.id);
      this._repository.set(id, entity);
    }
    response.included.forEach(included => {
      let modelClass = this._getModelClass(data._type);
      let includedModel = new modelClass(included);
      let id = this.identifier(includedModel.get('_type'), includedModel.id);
      this._repository.set(id, includedModel);
    });
    return entity;
  }
}

export default Store;