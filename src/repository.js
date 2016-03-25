/**
 * Repository.
 * @module
 */
import _ from 'underscore'
import Backbone from 'backbone'
import RSVP from 'rsvp'

/**
 * Repository class which provides access to entities and stores them.
 */
class Repository {

  /**
   * Creates Repository.
   * @param {Function} entityClass - Model or collection class of repository model.
   * @param adapter - Adapter to any data source.
   */
  constructor(entityClass, adapter) {
    let collection = new entityClass();
    if (collection instanceof Backbone.Model) {
      this.modelClass = entityClass;
      this.collectionClass = Backbone.Collection.extend({
        model: this.modelClass
      });
    } else {
      this.collectionClass = entityClass;
      this.modelClass = entityClass.prototype.model;
    }
    this.collection = new this.collectionClass();
    this._adapter = adapter;
  }

  /**
   * Get model by link.
   * @param {number} id - Model Id.
   * @param {string} [link] - model link.
   * @returns {Promise} Promise for requested model.
   */
  get(id, link) {
    let func;
    if (link) {
      func = _.bind(this._adapter.getByLink, this._adapter, link);
    } else {
      func = _.bind(this._adapter.getById, this._adapter, id);
    }
    return this._get(func, id);
  }

  /**
   * Get collection by link.
   * @param {string} link - Collection link.
   * @returns {Promise} Promise for requested collection.
   */
  getCollectionByLink(link) {
    return new RSVP.Promise((resolve, reject) => {
      let collection = new this.collectionClass();
      this._adapter.getByLink(link).then(data => {
        collection.set(data);
        this.collection.set(collection.models);
        resolve(collection);
      }, () => {
        reject();
      });
    });
  }

  /**
   * Create model.
   * @param {object} attributes - Data to create model with.
   * @returns {Promise} Promise for created model.
   */
  create(attributes = {}) {
    return new RSVP.Promise((resolve, reject) => {
      let model = new this.modelClass();
      this._adapter.create(attributes).then(data => {
        model.set(data);
        this.collection.set(model);
        resolve(model);
      }, () => {
        reject();
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
    return new RSVP.Promise((resolve, reject) => {
      model.set(attributes);
      this._adapter.update(model.id, model.toJSON()).then((data) => {
        model.clear().set(data);
        resolve(model);
      }, () => {
        reject();
      });
    });
  }

  /**
   * Destroy model.
   * @param {number} id - Id of model to destroy.
   * @returns {Promise} Promise for destroy.
   */
  destroy(id) {
    return new RSVP.Promise((resolve, reject) => {
      let model = this.collection.get(id);
      if (model) {
        this._adapter.destroy(id).then(() => {
          this.collection.remove(model);
          resolve();
        }, () => {
          reject();
        });
      } else {
        reject('Model does not exist');
      }
    });
  }

  _get(func, id) {
    return new RSVP.Promise((resolve, reject) => {
      let model = this._pluck(id);
      if (model) {
        resolve(model);
      } else {
        let fetchPromise = this._fetch(func);
        fetchPromise.then((model) => {
          resolve(model);
        }, () => {
          reject();
        });
      }
    });
  }

  _fetch(func) {
    return new RSVP.Promise((resolve, reject) => {
      let model = new this.modelClass();
      func().then(data => {
        model.set(data);
        this.collection.set(model);
        resolve(model);
      }, () => {
        reject();
      });
    });
  }

  _pluck(id) {
    return this.collection.get(id);
  }
}

export {Repository};