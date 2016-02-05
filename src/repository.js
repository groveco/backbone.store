import _ from 'underscore'
import Backbone from 'backbone'
import RSVP from 'rsvp'

class Repository {

  constructor(collectionClass, adapter) {
    let collection = new collectionClass();
    if (collection instanceof Backbone.Model) {
      this.modelClass = collectionClass;
      this.collectionClass = Backbone.Collection.extend({
        model: this.modelClass
      });
    } else {
      this.collectionClass = collectionClass;
      this.modelClass = collectionClass.prototype.model;
    }
    this.collection = new this.collectionClass();
    this._adapter = adapter;
  }

  getById(id) {
    let func = _.bind(this._adapter.getById, this._adapter, id);
    return this._get(func, id);
  }

  getByLink(id, link) {
    let func = _.bind(this._adapter.getByLink, this._adapter, link);
    return this._get(func, id);
  }

  getCollectionByLink(link) {
    return new RSVP.Promise((resolve, reject) => {
      let collection = new this.collectionClass();
      this._adapter.getByLink(link).then(data => {
        collection.set(data);
        this.collection.set(collection.models);
        resolve(collection);
      }, () => {
        reject();
      });
    });
  }

  create(attributes = {}) {
    return new RSVP.Promise((resolve, reject) => {
      let model = new this.modelClass();
      this._adapter.create(attributes).then(data => {
        model.set(data);
        this.collection.set(model);
        resolve(model);
      }, () => {
        reject();
      });
    });
  }

  update(model, attributes) {
    return new RSVP.Promise((resolve, reject) => {
      model.set(attributes);
      this._adapter.update(model.id, model.toJSON()).then((data) => {
        model.clear().set(data);
        resolve(model);
      }, () => {
        reject();
      });
    });
  }

  destroy(id) {
    return new RSVP.Promise((resolve, reject) => {
      let model = this.collection.get(id);
      if (model) {
        this._adapter.destroy(id).then(() => {
          this.collection.remove(model);
          resolve();
        }, () => {
          reject();
        });
      } else {
        reject('Model does not exist');
      }
    });
  }

  _get(func, id) {
    return new RSVP.Promise((resolve, reject) => {
      let model = this.collection.get(id);
      if (model) {
        resolve(model);
      } else {
        model = new this.modelClass();
        func().then(data => {
          model.set(data);
          this.collection.set(model);
          resolve(model);
        }, () => {
          reject();
        });
      }
    });
  }
}

export {Repository};