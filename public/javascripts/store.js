import Backbone from 'backbone'

let addGetAsync = function (store) {
  Backbone.Model.prototype.getAsync = function (type) {
    let modelName = this.relatedModels[type];

    let relationship = this.get('relationships')[modelName];
    if (!relationship) {
      throw new Error('There is no related model "' + modelName + '".');
    }

    let repository = store.getRepository(modelName);
    if (!repository) {
      throw new Error('Can`t get repository for "' + modelName + '".');
    }

    if (relationship.link) {
      return repository.getByLink(relationship.id, relationship.link);
    } else {
      return repository.getById(relationship.id);
    }
  }
};

let store = null;

class Store {
  constructor() {
    this._repositories = new Map();
  }

  static instance() {
    if (store === null) {
      store = new Store();
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