/**
 * Repository.
 * @module
 */
import Backbone from 'backbone'

/**
 * Repository class which provides access to entities and stores them.
 */
class Repository {

  /**
   * Creates Repository.
   * @param {Function} entityClass - Model or collection class of repository model.
   */
  constructor(entityClass) {
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
    this._collection = new this.collectionClass();
  }

  /**
   * Create a model.
   * @param {object} [attributes] - Data to create model with.
   */
  createModel(attributes = {}) {
    return new this.modelClass(attributes);
  }

  /**
   * Create a collection.
   * @param {object} [models] - Data to create model with.
   */
  createCollection(models = []) {
    return new this.collectionClass(models);
  }

  /**
   * Get entity from cache by id.
   * @param {number|string} id - Entity id.
   * @returns {object} Entity with given id if it exists.
   */
  get(id) {
    return this._collection.get(id);
  }

  /**
   * Add ot update model(s) in cache.
   * @param {object|array} models - Model or array of models to add/update in cache.
   */
  set(models) {
    this._collection.set(models);
  }

  /**
   * Remove model from cache.
   * @param {number|string} id - Entity id.
   */
  remove(id) {
    this._collection.remove(id);
  }
}

export default Repository;