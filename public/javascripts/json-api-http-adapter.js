import $ from 'jquery'
import {HttpMethods} from './http-methods'

class JsonApiHttpAdapter {
  constructor(url) {
    this._url = url;
  }

  query(options) {
    let deferred = $.Deferred();
    this._ajax(null, HttpMethods.GET, options).then(data => {
      deferred.resolve(this._parse(data));
    }, () => {
      deferred.reject();
    });
    return deferred;
  }

  getById(id) {
    let deferred = $.Deferred();
    this._ajax(id, HttpMethods.GET).then(data => {
      deferred.resolve(this._parse(data));
    }, () => {
      deferred.reject();
    });
    return deferred;
  }

  create(attributes) {
    let deferred = $.Deferred();
    this.ajax(null, HttpMethods.POST, attributes).then(data => {
      deferred.resolve(this._parse(data));
    }, () => {
      deferred.reject();
    });
    return deferred;
  }

  update(id, attributes) {
    let deferred = $.Deferred();
    this.ajax(id, HttpMethods.PUT, attributes).then(data => {
      deferred.resolve(this._parse(data));
    }, () => {
      deferred.reject();
    });
    return deferred;
  }

  destroy(id) {
    let deferred = $.Deferred();
    this._ajax(id, HttpMethods.DELETE).then(() => {
      deferred.resolve();
    }, () => {
      deferred.reject();
    });
    return deferred;
  }

  _parse(jsonApiData) {
    let result = {};
    Object.assign(result, jsonApiData.data.attributes);
    result.id = jsonApiData.data.id;
    if (jsonApiData.data.relationships) {
      Object.keys(jsonApiData.data.relationships).forEach((key, index) => {
        let relationshipData = jsonApiData.data.relationships[key].data;
        if (relationshipData instanceof Array) {
          result[key] = relationshipData.map(item => item.id);
        } else {
          result[key] = relationshipData.id;
        }
      });
    }
    return result;
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

export {JsonApiHttpAdapter};