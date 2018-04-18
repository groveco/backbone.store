/**
 * Repository.
 * @module
 */
import RepositoryCollection from './repository-collection'

/**
 * Repository class which provides access to entities and stores them.
 */
class Repository {
  constructor () {
    this._collection = new RepositoryCollection()
  }

  /**
   * Get entity from cache by id.
   * @param {string} identifier - Entity self link if type-id identifier.
   * @returns {object} Entity with given id if it exists.
   */
  get (identifier) {
    let result = this._collection.findWhere({ _self: identifier })
    if (!result) {
      result = this._collection.find((elem) => {
        return `${elem.get('_type')}__${elem.id}` === identifier
      })
    }
    return result
  }

  /**
   * Add ot update model(s) in cache.
   * @param {object|array} models - Model or array of models to add/update in cache.
   */
  set (model) {
    let self = model.get('_self')
    if (self) {
      let existingModel = this.get(self)
      if (existingModel) {
        existingModel.clear().set(model.toJSON())
      } else {
        this._collection.add(model)
      }
    } else {
      this._collection.add(model)
    }
  }

  /**
   * Remove model from cache.
   * @param {string} link - Entity self link.
   */
  remove (link) {
    let model = this._collection.findWhere({ _self: link })
    if (model) {
      this._collection.remove(model)
    }
  }
}

export default Repository
