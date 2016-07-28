import {Model} from 'backbone';
import {Promise} from 'rsvp';

class ProxyObject {
  constructor(content) {
    if (content == null) {
      content = new Model();
    }

    this.content = content;
    this.promise = new Promise(resolve => resolve(content));
  }

  get promise() {
    return this._promise;
  }

  set promise(promise) {
    this._promise = promise;
    return promise
      .then(resource => {
        this.content = resource;
        return resource;
      });
  }

  then() {
    return this.promise.then(...arguments);
  }

  catch() {
    return this.promise.catch(...arguments);
  }

  finally() {
    return this.promise.finally(...arguments);
  }

  get length() {
    return this.content.length;
  }

  map() {this.content.map(...arguments);}
  reduce() {this.content.reduce(...arguments);}
  at() {this.content.at(...arguments);}
}

export default ProxyObject;
