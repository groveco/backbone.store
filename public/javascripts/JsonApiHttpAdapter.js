import $ from 'jquery'

class JsonApiHttpAdapter {
  constructor(url) {
    this._url = url;
  }

  getById(id) {
    let deferred = $.Deferred();
    this._ajax(id, 'GET').then(function (data) {
      deferred.resolve(data);
    }, function () {
      deferred.reject();
    });
    return deferred;
  }

  create(attributes) {
    let deferred = $.Deferred();
    this.ajax(null, 'POST', attributes).then(function (data) {
      deferred.resolve(data);
    }, function () {
      deferred.reject();
    });
    return deferred;
  }

  delete(id) {
    let deferred = $.Deferred();
    this._ajax(id, 'DELETE').then(function () {
      deferred.resolve();
    }, function () {
      deferred.reject();
    });
    return deferred;
  }

  _ajax(id, type, data) {
    let deferred = $.Deferred();
    let options = {
      url: this._url,
      type: type,
      contentType: 'application/vnd.api+json',
      success: function (data) {
        deferred.resolve(data);
      },
      error: function () {
        deferred.reject();
      }
    };
    if (id) {
      options.url += id + '/';
    }
    if (data) {
      options.data = data;
    }
    $.ajax(options);
    return deferred;
  }
}