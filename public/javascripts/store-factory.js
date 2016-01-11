import {Store} from './store'
import Backbone from 'backbone'

function addGetAsync(store) {
  Backbone.Model.prototype.getAsync = function (type) {
    let modelName = this.relatedModels[type];
    if (modelName) {
      let id = this.get(type);
      let repository = store.getRepository(modelName);
      if (repository) {
        return repository.getById(id);
      } else {
        throw new Error('Can`t get repository for "' + type + '".');
      }
    } else {
      throw new Error('There is no related model "' + type + '".');
    }
  }
}

let factory = function () {
  let store = null;
  return {
    getStore: function () {
      if(store === null) {
        store = new Store();
        addGetAsync(store);
      }
      return store;
    }
  }
};

export {factory}