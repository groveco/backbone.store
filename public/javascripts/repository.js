import $ from 'jquery';

class Repository {

  constructor(collectionClass, adapter) {
    this.collectionClass = collectionClass;
    this.modelClass = collectionClass.prototype.model;
    this.collection = new this.collectionClass();
    this._adapter = adapter;
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

  getById(id) {
    let deferred = $.Deferred();
    let model = this.collection.get(id);
    if (model) {
      deferred.resolve(model);
    } else {
      model = new this.modelClass();
      this._adapter.getById(id).then(data => {
        model.set(data);
        this.collection.set(model);
        deferred.resolve(model);
      }, () => {
        deferred.reject(xhr.responseText);
      });
    }
    return deferred;
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
  }

  delete(id) {
    let deferred = $.Deferred();
    let model = this.collection.get(id);
    if (model) {
      this._adapter.delete(id).then(() => {
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