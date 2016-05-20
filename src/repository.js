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
   * @param {string} link - Entity self link.
   * @returns {object} Entity with given id if it exists.
   */
  get(link) {
    return this._collection.findWhere({ _self: link });
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
   * @param {string} link - Entity self link.
   */
  remove(link) {
    let model = this._collection.findWhere({ _self: link });
    if (model) {
      this._collection.remove(model);
    }
  }
}

export default Repository;