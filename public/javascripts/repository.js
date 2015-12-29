import $ from 'jquery';

class Repository {

  constructor(collectionClass) {
    this.collectionClass = collectionClass;
    this.modelClass = collectionClass.prototype.model;
    this.collection = new this.collectionClass();
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
    var that = this;
    var deferred = $.Deferred();
    var model = this.collection.get(id);
    if (model) {
      deferred.resolve(model);
    } else {
      model = new this.modelClass();
      model.set(model.idAttribute, id);
      model.fetch().then(function () {
        that.collection.set(model);
        deferred.resolve(model);
      }, function (xhr) {
        deferred.reject(xhr.responseText);
      });
    }
    return deferred;
  }

  save(id, attributes) {
    attributes = attributes || {};
    var that = this;
    var deferred = $.Deferred();
    var model;
    if (id instanceof this.modelClass) {
      model = id;
    } else {
      model = new this.modelClass();
      model.set(model.idAttribute, id);
    }
    model.set(attributes);
    model.save().then(function () {
      that.collection.set(model);
      deferred.resolve(model);
    }, function (xhr) {
      deferred.reject(xhr.responseText);
    });
    return deferred;
  }

  delete(id) {
    var that = this;
    var deferred = $.Deferred();
    var model = this.collection.get(id);
    model.destroy().then(function () {
      deferred.resolve();
    }, function (xhr) {
      deferred.reject(xhr.responseText);
    });
    return deferred;
  }
}