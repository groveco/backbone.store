import {Collection} from 'backbone';
import {Promise} from 'rsvp';

class CollectionProxy {
  constructor(content) {
    if (content == null) {
      content = new Collection();
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

  //
  // Proxied methods and properties
  //

  get comparator() { return this.content.comparator; }
  get length() { return this.content.length; }
  get models() { return this.content.models; }

  at() { return this.content.at(...arguments); }
  findWhere() { return this.content.findWhere(...arguments); }
  get() { return this.content.get(...arguments); }
  map() { return this.content.map(...arguments); }
  pluck() { return this.content.pluck(...arguments); }
  pop() { return this.content.pop(...arguments); }
  push() { return this.content.push(...arguments); }
  reduce() { return this.content.reduce(...arguments); }
  set() { return this.content.set(...arguments); }
  shift() { return this.content.shift(...arguments); }
  slice() { return this.content.slice(...arguments); }
  sort() { return this.content.sort(...arguments); }
  toJSON() { return this.content.toJSON(...arguments); }
  where() { return this.content.where(...arguments); }
  forEach() { return this.content.forEach(...arguments); }
  reduceRight() { return this.content.reduceRight(...arguments); }
  find() { return this.content.find(...arguments); }
  findIndex() { return this.content.findIndex(...arguments); }
  findLastIndex() { return this.content.findLastIndex(...arguments); }
  filter() { return this.content.filter(...arguments); }
  reject() { return this.content.reject(...arguments); }
  every() { return this.content.every(...arguments); }
  some() { return this.content.some(...arguments); }
  contains() { return this.content.contains(...arguments); }
  invoke() { return this.content.invoke(...arguments); }
  max() { return this.content.max(...arguments); }
  min() { return this.content.min(...arguments); }
  sortBy() { return this.content.sortBy(...arguments); }
  groupBy() { return this.content.groupBy(...arguments); }
  shuffle() { return this.content.shuffle(...arguments); }
  toArray() { return this.content.toArray(...arguments); }
  size() { return this.content.size(...arguments); }
  first() { return this.content.first(...arguments); }
  initial() { return this.content.initial(...arguments); }
  rest() { return this.content.rest(...arguments); }
  last() { return this.content.last(...arguments); }
  without() { return this.content.without(...arguments); }
  indexOf() { return this.content.indexOf(...arguments); }
  lastIndexOf() { return this.content.lastIndexOf(...arguments); }
  isEmpty() { return this.content.isEmpty(...arguments); }
  chain() { return this.content.chain(...arguments); }
  difference() { return this.content.difference(...arguments); }
  sample() { return this.content.sample(...arguments); }
  partition() { return this.content.partition(...arguments); }
  countBy() { return this.content.countBy(...arguments); }
  indexBy() { return this.content.indexBy(...arguments); }
}

export default CollectionProxy;
