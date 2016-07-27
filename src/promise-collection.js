import {Collection} from 'backbone';

export default Collection.extend({
  promise: null,

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
