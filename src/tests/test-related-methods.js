import Backbone from 'backbone';
import getStore from './infratructure/get-store'
import RelationalModel from './test-classes/relational-model'

describe('getRelated', function () {

  it('are added to backbone models', function () {
    assert.notProperty(Backbone.Model.prototype, 'pluckRelated');
    assert.notProperty(Backbone.Model.prototype, 'getRelated');
    assert.notProperty(Backbone.Model.prototype, 'fetchRelated');
    getStore();
    assert.property(Backbone.Model.prototype, 'pluckRelated');
    assert.property(Backbone.Model.prototype, 'getRelated');
    assert.property(Backbone.Model.prototype, 'fetchRelated');
  });

  it('calls get with link in store', function () {
    let id = 2;
    let link = '/api/test/2/';
    let model = new RelationalModel({
      id: 1,
      relationships: {
        test: {
          data: {
            id: id
          },
          links: {
            related: link
          }
        }
      }
    });
    let store = getStore();
    let spy = chai.spy.on(store, 'get');
    store.register('test', RelationalModel);
    model.getRelated('test');
    spy.should.have.been.called.with(link);
  });

  it('calls getCollection in repository if collection relation name is passed', function () {
    let link = '/api/tests/';
    let model = new RelationalModel({
      id: 1,
      relationships: {
        tests: {
          links: {
            related: link
          }
        }
      }
    });
    let store = getStore();
    let spy = chai.spy.on(store, 'getCollection');
    store.register('test', RelationalModel);
    model.fetchRelated('tests');
    spy.should.have.been.called.with(link);
  });

  it('throws exception if related model with this name is not defined', function () {
    let relation = 'notexisting';
    let model = new RelationalModel();
    let func = function () {
      model.getRelated(relation);
    };
    assert.throws(func, 'Relation for "' + relation + '" is not defined in the model.');
  });

  it('throws exception if there\'s no data in relation', function () {
    let relation = 'test';
    let model = new RelationalModel();
    let func = function () {
      model.getRelated(relation);
    };
    assert.throws(func, 'There is no related model "' + relation + '".');
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
    let store = getStore();
    let spy = chai.spy.on(store, 'getCollection');
    store.register('test', RelationalModel);
    let func = function () {
      model.getRelated(relation);
    };
    assert.throws(func, 'Can\'t fetch collection of "' + model.relatedCollections[relation] + '" without link.');
  });
});