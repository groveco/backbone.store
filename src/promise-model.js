import {Model} from 'backbone';

let PromiseModel = Model.extend({
  then() {
    return this.promise.then(...arguments);
  },

  catch() {
    return this.promise.catch(...arguments);
  },

  finally() {
    return this.promise.finally(...arguments);
  }
});

Object.defineProperty(PromiseModel.prototype, 'promise', {
  get() {
    return this._promise;
  },

  set(promise) {
    this._promise = promise;
    return promise
      .then(resource => {
        this.set(resource);
        return resource;
      });
  },
});

export default PromiseModel;
