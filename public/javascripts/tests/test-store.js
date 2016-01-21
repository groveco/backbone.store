import Backbone from 'backbone'
import {Model} from './test-classes/model'
import {repositoryFactory} from '../repository-factory'
import {Store} from '../store'

let createRepository = function () {
  return repositoryFactory('model', Model, '/api/model/')
};

describe('Store', function () {

  it('adds getAsync to Backbone model on first instantiation', function () {
    assert.notProperty(Backbone.Model.prototype, 'getAsync');
    Store.instance();
    assert.property(Backbone.Model.prototype, 'getAsync');
  });

  it('instance method instantiates only one instance', function () {
    let store1 = Store.instance();
    let store2 = Store.instance();
    assert.equal(store1, store2);
  });

  it('can\'t be instantiated with "new"', function () {
    let func = function () {
      new Store();
    };
    assert.throws(func);
  });

  it('registers repository', function () {
    let repo = createRepository();
    let store = Store.instance();
    store.register(repo);
    assert(store.getRepository(repo.modelName))
  })
});