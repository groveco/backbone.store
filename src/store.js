/**
 * Store.
 * @module
 */
import Backbone from 'backbone'
import Symbol from 'es6-symbol'

/**
 * Add getAsunc method to Backbone.Model.
 * @param {Store} store - Backbone Store instance that will be used in getAsync method.
 */
let addGetAsync = function (store) {
  Backbone.Model.prototype.getAsync = function (type) {
    let isCollection = false;
    let modelName = this.relatedModels && this.relatedModels[type];
    if (!modelName) {
      modelName = this.relatedCollections && this.relatedCollections[type];
      isCollection = true;
    }
    if (!modelName) {
      throw new Error('Relation for "' + type + '" is not defined in the model.');
    }

    let relationship = this.get('relationships') && this.get('relationships')[type];
    if (!relationship) {
      throw new Error('There is no related model "' + modelName + '".');
    }

    let repository = store.getRepository(modelName);
    if (!repository) {
      throw new Error('Can`t get repository for "' + modelName + '".');
    }

    if (isCollection) {
      if (relationship.link) {
        return repository.getCollectionByLink(relationship.link);
      } else {
        throw new Error('Can\'t fetch collection of "' + modelName + '" without link.');
      }
    } else {
      if (relationship.link) {
        return repository.getByLink(relationship.id, relationship.link);
      } else {
        return repository.getById(relationship.id);
      }
    }
  }
};

let store = null;
let privateEnforcer = Symbol();

/**
 * Backbone Store class that manages all repositories.
 */
class Store {

  /**
   * Create Store.
   * @param {Symbol} enforcer - Symbol to make constructor private.
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
      addGetAsync(store);
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