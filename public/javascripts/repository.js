import $ from 'jquery';
import Backbone from 'backbone';

class Repository {

  constructor(modelName, collectionClass, adapter) {
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
    this.modelName = modelName;
  }

  getById(id) {
    let func = this._adapter.getById.bind(this._adapter, id);
    return this._get(func, id);
  }

  getByLink(id, link) {
    let func = this._adapter.getByLink.bind(this._adapter, link);
    return this._get(func, id);
  }

  getCollectionByLink(link) {
    let deferred = $.Deferred();
    let collection = new this.collectionClass();
    this._adapter.getByLink(link).then(data => {
      collection.set(data);
      this.collection.set(collection.models);
      deferred.resolve(collection);
    }, () => {
      deferred.reject();
    });
    return deferred;
  }

  create(attributes) {
    attributes = attributes || {};
    let deferred = $.Deferred();
    let model = new this.modelClass();
    this._adapter.create(attributes).then(data => {
      model.set(data);
      this.collection.set(model);
      deferred.resolve(model);
    }, () => {
      deferred.reject();
    });
    return deferred;
  }

  update(model, attributes) {
    let deferred = $.Deferred();
    model.set(attributes);
    this._adapter.update(model.id, model.toJSON()).then((data) => {
      model.clear().set(data);
      deferred.resolve(model);
    }, () => {
      deferred.reject();
    });
    return deferred;
  }

  destroy(id) {
    let deferred = $.Deferred();
    let model = this.collection.get(id);
    if (model) {
      this._adapter.destroy(id).then(() => {
        this.collection.remove(model);
        deferred.resolve();
      }, () => {
        deferred.reject();
      });
    } else {
      deferred.reject('Model does not exist');
    }
    return deferred;
  }

  _get(func, id) {
    let deferred = $.Deferred();
    let model = this.collection.get(id);
    if (model) {
      deferred.resolve(model);
    } else {
      model = new this.modelClass();
      func().then(data => {
        model.set(data);
        this.collection.set(model);
        deferred.resolve(model);
      }, () => {
        deferred.reject();
      });
    }
    return deferred;
  }
}

export {Repository};