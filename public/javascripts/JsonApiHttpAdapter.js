import $ from 'jquery'

class JsonApiHttpAdapter {
  constructor(url) {
    this._url = url;
  }

  query(options) {
    let deferred = $.Deferred();
    this._ajax(null, 'GET', options).then(data => {
      deferred.resolve(data);
    }, () => {
      deferred.reject();
    });
    return deferred;
  }

  getById(id) {
    let deferred = $.Deferred();
    this._ajax(id, 'GET').then(data => {
      deferred.resolve(data);
    }, () => {
      deferred.reject();
    });
    return deferred;
  }

  create(attributes) {
    let deferred = $.Deferred();
    this.ajax(null, 'POST', attributes).then(data => {
      deferred.resolve(data);
    }, () => {
      deferred.reject();
    });
    return deferred;
  }

  update(id, attributes) {
    let deferred = $.Deferred();
    this.ajax(id, 'PUT', attributes).then(data => {
      deferred.resolve(data);
    }, () => {
      deferred.reject();
    });
    return deferred;
  }

  delete(id) {
    let deferred = $.Deferred();
    this._ajax(id, 'DELETE').then(() => {
      deferred.resolve();
    }, () => {
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
      success: data => {
        deferred.resolve(data);
      },
      error: () => {
        deferred.reject();
      }
    };
    if (id) {
      options.url += id + '/';
    }
    if (data) {
      if (type in ['POST', 'PUT']) {
        options.data = JSON.stringify(data);
      } else {
        options.data = data;
      }
    }
    $.ajax(options);
    return deferred;
  }
}