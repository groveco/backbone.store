import $ from 'jquery';

class Repository {

  constructor(collectionClass, adapter) {
    this.collectionClass = collectionClass;
    this.modelClass = collectionClass.prototype.model;
    this.collection = new this.collectionClass();
    this._adapter = adapter;
  }

  query(options) {
    var that = this;
    var deferred = $.Deferred();
    var collection = new this.collectionClass();
    collection.fetch({
      data: options
    }).then(function () {
      that.collection.set(collection.models);
      deferred.resolve(collection);
    }, function (xhr) {
      deferred.reject(xhr.responseText);
    });
    return deferred;
  }

  getById(id) {
    let that = this;
    let deferred = $.Deferred();
    let model = this.collection.get(id);
    if (model) {
      deferred.resolve(model);
    } else {
      model = new this.modelClass();
      this._adapter.getById(id).then(function (data) {
        model.set(data);
        that.collection.set(model);
        deferred.resolve(model);
      }, function (xhr) {
        deferred.reject(xhr.responseText);
      });
    }
    return deferred;
  }

  create(attributes) {
    attributes = attributes || {};
    let that = this;
    let deferred = $.Deferred();
    let model = this.collection.get(id);
    if (!model) {
      model = new this.modelClass();
      this._adapter.save(attributes).then(function (data) {
        model.set(data);
        that.collection.set(model);
        deferred.resolve(model);
      }, function (xhr) {
        deferred.reject(xhr.responseText);
      });
    } else {
      deferred.reject('Model already exists');
    }
    return deferred;
  }

  delete(id) {
    let that = this;
    let deferred = $.Deferred();
    let model = this.collection.get(id);
    if (model) {
      this._adapter.delete(id).then(function () {
        that.collection.remove(model);
        deferred.resolve();
      }, function (xhr) {
        deferred.reject(xhr.responseText);
      });
    } else {
      deferred.reject('Model already exists');
    }
    return deferred;
  }
}