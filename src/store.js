/**
 * Store.
 * @module
 */
import Backbone from 'backbone';
import Repository from './repository';
import RSVP from 'rsvp';

let actions = {
  GET: 0,
  PLUCK: 1,
  FETCH: 2
};

/**
 * Add getRelated, fetchRelated and pluckRelated methods to Backbone.Model.
 * @param {Store} store - Backbone Store instance that will be used in getAsync method.
 */
let addRelatedMethods = function (store) {
  let resolveRelatedMethod = function (relationName, action) {
    let isCollection = false;
    let modelName = this.relatedModels && this.relatedModels[relationName];
    if (!modelName) {
      modelName = this.relatedCollections && this.relatedCollections[relationName];
      isCollection = true;
    }
    if (!modelName) {
      throw new Error('Relation for "' + relationName + '" is not defined in the model.');
    }

    let relationship = this.get('relationships') && this.get('relationships')[relationName];
    if (!relationship) {
      throw new Error('There is no related model "' + modelName + '".');
    }

    let link = relationship.links && relationship.links.related;
    if (link) {
      if (isCollection) {
        if (link) {
          if (action == actions.FETCH) {
            return store.getCollection(link);
          } else {
            throw new Error('Collection should be fetched. Use "fetchRelated".');
          }
        } else {
          throw new Error('Can\'t fetch collection of "' + modelName + '" without link.');
        }
      } else {
        if (action === actions.GET) {
          return store.get(link);
        } else if (action === actions.FETCH) {
          return store.fetch(link);
        } else if (action === actions.PLUCK) {
          return store.pluck(link);
        } else {
          throw new Error('Unknown action');
        }
      }
    }
    else {
      return new RSVP.Promise(resolve => {
        resolve(null);
      })
    }
  };

  /**
   * Get related model. If model is cached on front-end it will be returned from cache, otherwise it will be fetched.
   * @param {string} relationName - Name of relation to requested model.
   * @returns {Promise} Promise for requested model.
   */
  Backbone.Model.prototype.getRelated = function (relationName) {
    return resolveRelatedMethod.call(this, relationName, actions.GET);
  };

  /**
   * Fetch related model or collection from server.
   * @param {string} relationName - Name of relation to requested model or collection.
   * @returns {Promise} Promise for requested model or collection.
   */
  Backbone.Model.prototype.fetchRelated = function (relationName) {
    return resolveRelatedMethod.call(this, relationName, actions.FETCH);
  };

  /**
   * Get related model from front-end cache.
   * @param {string} relationName - Name of relation to requested model.
   * @returns {Promise} Promise for requested model.
   */
  Backbone.Model.prototype.pluckRelated = function (relationName) {
    return resolveRelatedMethod.call(this, relationName, actions.PLUCK);
  };
};

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
    return new RSVP.Promise((resolve) => {
      let model = this.pluck(link);
      if (model) {
        resolve(model);
      } else {
        this.fetch(link).then((model) => {
          resolve(model);
        });
      }
    });
  }

  /**
   * Fetch model by Id or link from server.
   * @param {string} link - Model link.
   * @returns {Promise} Promise for requested model.
   */
  fetch(link) {
    return new RSVP.Promise((resolve) => {
      this._adapter.get(link).then(response => {
        let model = this._setModels(response);
        resolve(model);
      }, () => {
        resolve(null);
      });
    });
  }

  /**
   * Get model by Id from front-end cache.
   * @param {string} link - Model self link.
   * @returns {object} Requested model.
   */
  pluck(link) {
    return this._repository.get(link);
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
    return new RSVP.Promise((resolve) => {
      model.set(attributes);
      this._adapter.update(model.get('_self'), model.toJSON()).then((response) => {
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