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

  query(options) {
    var deferred = $.Deferred();
    var collection = new this.collectionClass();
    collection.fetch({
      data: options
    }).then(() => {
      this.collection.set(collection.models);
      deferred.resolve(collection);
    }, () => {
      deferred.reject();
    });
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
        deferred.reject(xhr.responseText);
      });
    }
    return deferred;
  }

  getById(id) {
    let func = this._adapter.getById.bind(this._adapter, id);
    return this._get(func, id);
  }

  getByLink(id, link) {
    let func = this._adapter.getByLink.bind(this._adapter, link);
    return this._get(func, id);
  }

  create(attributes) {
    attributes = attributes || {};
    let deferred = $.Deferred();
    let model = this.collection.get(id);
    if (!model) {
      model = new this.modelClass();
      this._adapter.save(attributes).then(data => {
        model.set(data);
        this.collection.set(model);
        deferred.resolve(model);
      }, () => {
        deferred.reject(xhr.responseText);
      });
    } else {
      deferred.reject('Model already exists');
    }
    return deferred;
  }

  update(model, attributes) {
    let deferred = $.Deferred();
    model.set(attributes);
    this._adapter.update(model.id, model.toJSON()).then((data) => {
      this.collection.remove(model);
      model.clear().set(data);
      this.collection.add(model);
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
      deferred.reject('Model already exists');
    }
    return deferred;
  }
}

export {Repository};