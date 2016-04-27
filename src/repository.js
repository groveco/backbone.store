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
   * Get model by Id or link. If model is cached on front-end it will be returned from cache, otherwise it will be
   * fetched.
   * @param {number} id - Model Id.
   * @param {string} [link] - Model link.
   * @returns {Promise} Promise for requested model.
   */
  get(id, link) {
    return new RSVP.Promise((resolve, reject) => {
      let model = this.pluck(id);
      if (model) {
        resolve(model);
      } else {
        this.fetch(id, link).then((model) => {
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
   * @param {number} id - Model Id.
   * @param {string} [link] - Model link.
   * @returns {Promise} Promise for requested model.
   */
  fetch(id, link) {
    return new RSVP.Promise((resolve, reject) => {
      let model = new this.modelClass();
      let adapterPromise;
      if (link) {
        adapterPromise = this._adapter.getByLink(link);
      } else {
        adapterPromise = this._adapter.getById(id);
      }
      adapterPromise.then(data => {
        model.set(data);
        this.collection.set(model);
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
   * @param {number} id - Model Id.
   * @returns {Promise} Promise for requested model.
   */
  pluck(id) {
    return this.collection.get(id);
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
      }).catch(error => {
        console.error(error);
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
      }).catch(error => {
        console.error(error);
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
      }).catch(error => {
        console.error(error);
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
        }).catch(error => {
          console.error(error);
        });
      } else {
        reject('Model does not exist');
      }
    });
  }
}

export {Repository};