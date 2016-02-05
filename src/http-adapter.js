import $ from 'jquery'
import {HttpMethods} from './http-methods'
import RSVP from 'rsvp'

class HttpAdapter {

  constructor(url, parser) {
    this._parser = parser;
    this._url = url;
  }

  getById(id) {
    return new RSVP.Promise((resolve, reject) => {
      this._ajax(id, HttpMethods.GET).then(data => {
        resolve(this._parser.parse(data));
      }, () => {
        reject();
      });
    });
  }

  getByLink(link) {
    return new RSVP.Promise((resolve, reject) => {
      this._ajaxByLink(link).then(data => {
        resolve(this._parser.parse(data));
      }, () => {
        reject();
      });
    });
  }

  create(attributes) {
    return new RSVP.Promise((resolve, reject) => {
      this._ajax(null, HttpMethods.POST, attributes).then(data => {
        resolve(this._parser.parse(data));
      }, () => {
        reject();
      });
    });
  }

  update(id, attributes) {
    return new RSVP.Promise((resolve, reject) => {
      this._ajax(id, HttpMethods.PUT, attributes).then(data => {
        resolve(this._parser.parse(data));
      }, () => {
        reject();
      });
    });
  }

  destroy(id) {
    return new RSVP.Promise((resolve, reject) => {
      this._ajax(id, HttpMethods.DELETE).then(() => {
        resolve();
      }, () => {
        reject();
      });
    });
  }

  _ajax(id, type, data) {
    return new RSVP.Promise((resolve, reject) => {
      let options = {
        url: this._url,
        type: type,
        contentType: 'application/vnd.api+json',
        success: data => {
          resolve(data);
        },
        error: () => {
          reject();
        }
      };
      if (id) {
        options.url += id + '/';
      }
      if (data) {
        if ([HttpMethods.POST, HttpMethods.PUT].indexOf(type) > -1) {
          options.data = JSON.stringify(data);
        } else {
          options.data = data;
        }
      }
      $.ajax(options);
    });
  }

  _ajaxByLink(link) {
    return new RSVP.Promise((resolve, reject) => {
      let options = {
        url: link,
        type: HttpMethods.GET,
        contentType: 'application/vnd.api+json',
        success: data => {
          resolve(data);
        },
        error: () => {
          reject();
        }
      };
      $.ajax(options);
    });
  }

}

export {HttpAdapter};