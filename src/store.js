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
   */
  constructor(adapter) {
    this._adapter = adapter;
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
   * @param {string} link - Model link.
   * @returns {Promise} Promise for requested model.
   */
  get(link) {
    let model = this.pluck(link)
    if (model) {
      return new RSVP.Promise(resolve => resolve(model))
    } else {
      return this.fetch(link)
    }
  }

  /**
   * Fetch model by Id or link from server.
   * @param {string} link - Model link.
   * @returns {Promise} Promise for requested model.
   */
  fetch(link) {
    let existingPromise = this._pending[link];

    if (existingPromise) {
      return existingPromise;
    } else {
      let promise = this._adapter.get(link)
        .then(response => {
          return this._setModels(response);
        })

      promise.finally(() => {
        return this._pending[link] = null;
      });

      this._pending[link] = promise;

      return promise;
    }
  }

  /**
   * Get model by link from front-end cache.
   * @param {string} link - Model self link.
   * @returns {object} Requested model.
   */
  pluck(link) {
    return this._repository.get(link);
  }

  /**
   * Get model by Type and Id from front-end cache.
   * @param {string} type - Model type.
   * @param {string|number} id - Model id.
   * @returns {object} Requested model.
   */
  pluckByTypeId(type, id) {
    return this._repository.get(`${type}__${id}`);
  }

  /**
   * Get collection by link.
   * @param {string} link - Collection link.
   * @returns {Promise} Promise for requested collection.
   */
  getCollection(link) {
    return this._adapter.get(link)
      .then(response => this._setModels(response));
  }

  /**
   * Create model.
   * @param {string} link - Url for POST request.
   * @param {object} attributes - Data to create model with.
   * @returns {Promise} Promise for created model.
   */
  create(link, attributes = {}) {
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
   * @param {string} link - Self link of model to destroy.
   * @returns {Promise} Promise for destroy.
   */
  destroy(link) {
    return new RSVP.Promise((resolve) => {
      let model = this._repository.get(link);
      if (model) {
        this._adapter.destroy(link).then(() => {
          this._repository.remove(link);
          resolve();
        }, () => {
          throw new Error('Couldn\'t destroy entity.');
        });
      } else {
        throw new Error('Model does not exist');
      }
    });
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
        this._repository.set(models);
      } else {
        entity = new Backbone.Collection();
      }
    } else {
      let modelClass = this._getModelClass(data._type);
      entity = new modelClass(data);
      this._repository.set(entity);
    }
    response.included.forEach(included => {
      let modelClass = this._getModelClass(data._type);
      let includedModel = new modelClass(included);
      this._repository.set(includedModel);
    });
    return entity;
  }
}

export default Store;
