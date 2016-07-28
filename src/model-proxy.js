import {Model} from 'backbone';
import {Promise} from 'rsvp';

class ModelProxy {
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

  //
  // Proxied methods and properties
  //

  get attributes() { return this.content.attributes; }
  get changed() { return this.content.changed; }
  get changedAttributes() { return this.content.changedAttributes; }
  get cid() { return this.content.cid; }
  get defaults() { return this.content.defaults; }
  get hasChanged() { return this.content.hasChanged; }
  get id() { return this.content.id; }
  get idAttribute() { return this.content.idAttribute; }
  get isNew() { return this.content.isNew; }
  get isValid() { return this.content.isValid; }
  get previousAttributes() { return this.content.previousAttributes; }
  get validationError() { return this.content.validationError; }

  chain() { return this.content.chain(...arguments); }
  clear() { return this.content.clear(...arguments); }
  escape() { return this.content.escape(...arguments); }
  get() { return this.content.get(...arguments); }
  has() { return this.content.has(...arguments); }
  invert() { return this.content.invert(...arguments); }
  isEmpty() { return this.content.isEmpty(...arguments); }
  keys() { return this.content.keys(...arguments); }
  omit() { return this.content.omit(...arguments); }
  pairs() { return this.content.pairs(...arguments); }
  pick() { return this.content.pick(...arguments); }
  previous() { return this.content.previous(...arguments); }
  set() { return this.content.set(...arguments); }
  toJSON() { return this.content.toJSON(...arguments); }
  unset() { return this.content.unset(...arguments); }
  validate() { return this.content.validate(...arguments); }
  values() { return this.content.values(...arguments); }
}

export default ModelProxy;
