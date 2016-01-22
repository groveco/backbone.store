import Backbone from 'backbone'

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

class Store {
  constructor(enforcer) {
    if (enforcer !== privateEnforcer) {
      throw new Error("Constructor is private, use Store.instance() instead");
    }
    this._repositories = new Map();
  }

  static instance() {
    if (store === null) {
      store = new Store(privateEnforcer);
      addGetAsync(store);
    }
    return store;
  }

  register(repository) {
    this._repositories.set(repository.modelName, repository);
  }

  getRepository(modelName) {
    return this._repositories.get(modelName);
  }
}

export {Store};