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
  chain() { return this.content.chain(...arguments); }
  contains() { return this.content.contains(...arguments); }
  countBy() { return this.content.countBy(...arguments); }
  difference() { return this.content.difference(...arguments); }
  every() { return this.content.every(...arguments); }
  filter() { return this.content.filter(...arguments); }
  find() { return this.content.find(...arguments); }
  findIndex() { return this.content.findIndex(...arguments); }
  findLastIndex() { return this.content.findLastIndex(...arguments); }
  findWhere() { return this.content.findWhere(...arguments); }
  first() { return this.content.first(...arguments); }
  forEach() { return this.content.forEach(...arguments); }
  get() { return this.content.get(...arguments); }
  groupBy() { return this.content.groupBy(...arguments); }
  indexBy() { return this.content.indexBy(...arguments); }
  indexOf() { return this.content.indexOf(...arguments); }
  initial() { return this.content.initial(...arguments); }
  invoke() { return this.content.invoke(...arguments); }
  isEmpty() { return this.content.isEmpty(...arguments); }
  last() { return this.content.last(...arguments); }
  lastIndexOf() { return this.content.lastIndexOf(...arguments); }
  map() { return this.content.map(...arguments); }
  max() { return this.content.max(...arguments); }
  min() { return this.content.min(...arguments); }
  off() { return this.content.off(...arguments); }
  on() { return this.content.on(...arguments); }
  once() { return this.content.once(...arguments); }
  partition() { return this.content.partition(...arguments); }
  pluck() { return this.content.pluck(...arguments); }
  pop() { return this.content.pop(...arguments); }
  push() { return this.content.push(...arguments); }
  reduce() { return this.content.reduce(...arguments); }
  reduceRight() { return this.content.reduceRight(...arguments); }
  reject() { return this.content.reject(...arguments); }
  rest() { return this.content.rest(...arguments); }
  sample() { return this.content.sample(...arguments); }
  set() { return this.content.set(...arguments); }
  shift() { return this.content.shift(...arguments); }
  shuffle() { return this.content.shuffle(...arguments); }
  size() { return this.content.size(...arguments); }
  slice() { return this.content.slice(...arguments); }
  some() { return this.content.some(...arguments); }
  sort() { return this.content.sort(...arguments); }
  sortBy() { return this.content.sortBy(...arguments); }
  toArray() { return this.content.toArray(...arguments); }
  toJSON() { return this.content.toJSON(...arguments); }
  where() { return this.content.where(...arguments); }
  without() { return this.content.without(...arguments); }
}

export default CollectionProxy;
