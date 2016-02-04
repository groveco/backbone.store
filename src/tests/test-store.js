import Backbone from 'backbone'
import {FakeAdapter} from './test-classes/adapter'
import {Model} from './test-classes/model'
import {RelationalModel} from './test-classes/relational-model'
import {Repository} from '../repository'
import {repositoryFactory} from '../repository-factory'
import {Store} from '../store'

let createRepository = function () {
  return repositoryFactory(Model, '/api/model/')
};

let createFakeRepository = function () {
  return new Repository(Model, new FakeAdapter());
};

describe('Store', function () {

  it('is added to Backbone model on first store instantiation', function () {
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
    let name = 'test';
    store.register('test', repo);
    assert(store.getRepository(name));
  });
});

describe('getAsync', function () {

  it('calls getByLink in repository if link is provided', function () {
    let id = 2;
    let link = '/api/test/2/';
    let model = new RelationalModel({
      id: 1,
      relationships: {
        test: {
          id: id,
          link: link
        }
      }
    });
    let store = Store.instance();
    let repo = createFakeRepository();
    let spy = chai.spy.on(repo, 'getByLink');
    store.register('test', repo);
    model.getAsync('test');
    spy.should.have.been.called.with(id, link);
  });

  it('calls getById in repository if link is not provided', function () {
    let id = 2;
    let model = new RelationalModel({
      id: 1,
      relationships: {
        test: {
          id: id
        }
      }
    });
    let store = Store.instance();
    let repo = createFakeRepository();
    let spy = chai.spy.on(repo, 'getById');
    store.register('test', repo);
    model.getAsync('test');
    spy.should.have.been.called.with(id);
  });

  it('calls getCollectionByLink in repository if collection relation name is passed', function () {
    let link = '/api/tests/';
    let model = new RelationalModel({
      id: 1,
      relationships: {
        tests: {
          link: link
        }
      }
    });
    let store = Store.instance();
    let repo = createFakeRepository();
    let spy = chai.spy.on(repo, 'getCollectionByLink');
    store.register('test', repo);
    model.getAsync('tests');
    spy.should.have.been.called.with(link);
  });

  it('throws exception if related model with this name is not defined', function () {
    let relation = 'notexisting';
    let model = new RelationalModel();
    let func = function () {
      model.getAsync(relation);
    };
    assert.throws(func, 'Relation for "' + relation + '" is not defined in the model.');
  });

  it('throws exception if there\'s no data in relation', function () {
    let relation = 'test';
    let model = new RelationalModel();
    let func = function () {
      model.getAsync(relation);
    };
    assert.throws(func, 'There is no related model "' + relation + '".');
  });

  it('throws exception if repository is not registered for this model type', function () {
    let relation = 'test';
    let relationType = 'notexisting';
    let model = new RelationalModel({
      relationships: {
        test: {
          id: 1
        }
      }
    });
    model.relatedModels.test = relationType;
    let func = function () {
      model.getAsync(relation);
    };
    assert.throws(func, 'Can`t get repository for "' + relationType + '".');
  });

  it('throws exception if link is not set for the collection', function () {
    let relation = 'tests';
    let model = new RelationalModel({
      id: 1,
      relationships: {
        tests: {
          id: [1, 2]
        }
      }
    });
    let store = Store.instance();
    let repo = createFakeRepository();
    let spy = chai.spy.on(repo, 'getCollectionByLink');
    store.register('test', repo);
    let func = function () {
      model.getAsync(relation);
    };
    assert.throws(func, 'Can\'t fetch collection of "' + model.relatedCollections[relation] + '" without link.');
  });
});