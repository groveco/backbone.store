/**
 * Repository.
 * @module
 */

/**
 * Repository class which provides access to entities and stores them.
 */
class Repository {

  constructor() {
    this._collection = {};
  }

  /**
   * Get entity from cache by id.
   * @param {string} id - Entity identifier.
   * @returns {object} Entity with given id if it exists.
   */
  get(id) {
    return this._collection[id];
  }

  /**
   * Add ot update model(s) in cache.
   * * @param {string} id - Entity identifier.
   * @param {object} model - Model to add/update in cache.
   */
  set(id, model) {
    let existingModel = this.get(id);
    if (existingModel) {
      existingModel.clear().set(model.toJSON());
    } else {
      this._collection[id] = model;
    }
  }

  /**
   * Remove model from cache.
   * @param {string} id - Entity identifier.
   */
  remove(id) {
    delete this._collection[id];
  }
}

export default Repository;