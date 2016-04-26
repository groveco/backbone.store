/**
 * Store.
 * @module
 */
import Backbone from 'backbone'

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

let store = null;
let privateEnforcer = Math.random();

/**
 * Backbone Store class that manages all repositories.
 */
class Store {

  /**
   * Create Store.
   * @param {Number} enforcer - Symbol to make constructor private.
   */
  constructor(enforcer) {
    if (enforcer !== privateEnforcer) {
      throw new Error("Constructor is private, use Store.instance() instead");
    }
    this._repositories = {};
  }

  /**
   * Get Store instance as singleton.
   * @returns {Store} Store instance.
   */
  static instance() {
    if (store === null) {
      store = new Store(privateEnforcer);
      addRelatedMethods(store);
    }
    return store;
  }

  /**
   * Register repository in Store.
   * @param {string} modelName - model name that is used in relations definitions.
   * @param {Repository} repository - Registered repository.
   */
  register(modelName, repository) {
    this._repositories[modelName] = repository;
  }

  /**
   * Get registered repository.
   * @param {string} modelName - model name that is used in relations definitions and that was passed to register method.
   * @returns {Repository} Repository with specified modelName.
   */
  getRepository(modelName) {
    return this._repositories[modelName];
  }
}

export {Store};