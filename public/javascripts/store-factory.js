import {Store} from './store'
import Backbone from 'backbone'

let store = null;

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

let factory = {
  getStore: function () {
    if(store === null) {
      store = new Store();
      addGetAsync(store);
    }
    return store;
  }
};

export {factory}