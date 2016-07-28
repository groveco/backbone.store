import {Collection} from 'backbone';
import {Promise} from 'rsvp';

class ProxyArray {
  constructor(content, promise) {
    if (content == null) {
      content = new Collection();
    }

    this.content = content;
    if (promise != null) {
      this.promise = promise;
    } else {
      this.promise = new Promise(resolve => resolve(content));
    }
  }

  get id() {
    return this.content.id;
  }

  get length() {
    return this.content.length;
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

  get() {this.content.get(...arguments);}
  set() {this.content.set(...arguments);}

  then() {
    return this.promise.then(...arguments);
  }

  catch() {
    return this.promise.catch(...arguments);
  }

  finally() {
    return this.promise.finally(...arguments);
  }
}

export default ProxyArray;
