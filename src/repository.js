/**
 * Repository.
 * @module
 */
import RepositoryCollection from './repository-collection'

/**
 * Repository class which provides access to entities and stores them.
 */
class Repository {

  constructor() {
    this._collection = new RepositoryCollection();
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
    this._collection.add(models, {
      merge: true
    });
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