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

    let repository = store.getRepository(modelName);
    if (!repository) {
      throw new Error('Can`t get repository for "' + modelName + '".');
    }

    if (isCollection) {
      if (relationship.link) {
        if (action == actions.FETCH) {
          return repository.getCollectionByLink(relationship.link);
        } else {
          throw new Error('Collection should be fetched. Use "fetchRelated".');
        }
      } else {
        throw new Error('Can\'t fetch collection of "' + modelName + '" without link.');
      }
    } else {
      if (action === actions.GET) {
        return repository.get(relationship.id, relationship.link);
      } else if (action === actions.FETCH) {
        return repository.fetch(relationship.id, relationship.link);
      } else if (action === actions.PLUCK) {
        return repository.pluck(relationship.id);
      } else {
        throw new Error('Unknown action');
      }
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
    this._repositories = {};
  }

  /**
   * Register repository in Store.
   * @param {string} modelName - model name that is used in relations definitions.
   * @param {Function} modelClass - Model or collection class.
   */
  register(modelName, modelClass) {
    this._repositories[modelName] = new Repository(modelClass);
  }

  /**
   * Get model by Id or link. If model is cached on front-end it will be returned from cache, otherwise it will be
   * fetched.
   * @param {string} modelName - Entity class name.
   * @param {number} id - Model Id.
   * @param {string} [link] - Model link.
   * @returns {Promise} Promise for requested model.
   */
  get(modelName, id, link) {
    return new RSVP.Promise((resolve, reject) => {
      let model = this.pluck(modelName, id);
      if (model) {
        resolve(model);
      } else {
        this.fetch(modelName, id, link).then((model) => {
          resolve(model);
        }, () => {
          reject();
        }).catch(error => {
          console.error(error);
        });
      }
    });
  }

  /**
   * Fetch model by Id or link from server.
   * @param {string} modelName - Entity class name.
   * @param {number} id - Model Id.
   * @param {string} [link] - Model link.
   * @returns {Promise} Promise for requested model.
   */
  fetch(modelName, id, link) {
    return new RSVP.Promise((resolve, reject) => {
      let model = new this.modelClass();
      let adapterPromise;
      if (link) {
        adapterPromise = this._adapter.getByLink(link);
      } else {
        adapterPromise = this._adapter.getById(modelName, id);
      }
      adapterPromise.then(data => {
        model.set(data);
        this._repositories[modelName].set(model);
        resolve(model);
      }, () => {
        reject();
      }).catch(error => {
        console.error(error);
      });
    });
  }

  /**
   * Get model by Id from front-end cache.
   * @param {string} modelName - Entity class name.
   * @param {number} id - Model Id.
   * @returns {Promise} Promise for requested model.
   */
  pluck(modelName, id) {
    return this._repositories[modelName].get(id);
  }

  /**
   * Get collection by link.
   * @param {string} modelName - Entity class name.
   * @param {string} link - Collection link.
   * @returns {Promise} Promise for requested collection.
   */
  getCollectionByLink(modelName, link) {
    return new RSVP.Promise((resolve, reject) => {
      let repository = this._repositories[modelName];
      let collection = repository.createCollection();
      this._adapter.getByLink(link).then(data => {
        collection.set(data);
        repository.set(collection.models);
        resolve(collection);
      }, () => {
        reject();
      }).catch(error => {
        console.error(error);
      });
    });
  }

  /**
   * Create model.
   * @param {string} modelName - Entity class name.
   * @param {object} attributes - Data to create model with.
   * @returns {Promise} Promise for created model.
   */
  create(modelName, attributes = {}) {
    return new RSVP.Promise((resolve, reject) => {
      let repository = this._repositories[modelName];
      let model = repository.createModel();
      this._adapter.create(modelName, attributes).then(data => {
        model.set(data);
        repository.set(model);
        resolve(model);
      }, () => {
        reject();
      }).catch(error => {
        console.error(error);
      });
    });
  }

  /**
   * Create model.
   * @param {string} modelName - Entity class name.
   * @param {Backbone.Model} model - Model to update.
   * @param {object} attributes - Data to update model with.
   * @returns {Promise} Promise for updated model.
   */
  update(modelName, model, attributes) {
    return new RSVP.Promise((resolve, reject) => {
      let repository = this._repositories[modelName];
      model.set(attributes);
      this._adapter.update(modelName, model.id, model.toJSON()).then((data) => {
        model.clear().set(data);
        resolve(model);
      }, () => {
        reject();
      }).catch(error => {
        console.error(error);
      });
    });
  }

  /**
   * Destroy model.
   * @param {string} modelName - Entity class name.
   * @param {number} id - Id of model to destroy.
   * @returns {Promise} Promise for destroy.
   */
  destroy(modelName, id) {
    return new RSVP.Promise((resolve, reject) => {
      let repository = this._repositories[modelName];
      let model = repository.get(id);
      if (model) {
        this._adapter.destroy(modelName, id).then(() => {
          repository.remove(model);
          resolve();
        }, () => {
          reject();
        }).catch(error => {
          console.error(error);
        });
      } else {
        reject('Model does not exist');
      }
    });
  }
}

export default Store;