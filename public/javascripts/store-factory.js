import {Store} from './store'
let Backbone = require('backbone');

function addGetAsync(store) {
  Backbone.Model.prototype.getAsync = function (type) {
    let model = this.relatedModels[type];
    if (model) {
      let id = this.get(type);
      let repository = store.getRepository(model);
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

export function factory() {
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
}