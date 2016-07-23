import getStore from './infratructure/get-store';
import Model from '../src/repository-model';
import RelationalModel from './test-classes/relational-model';
import sinon from 'sinon';

describe('related methods', function () {
  describe('pluckRelated', function () {
    xit('hasOne returns a single model from the cache');
    xit('hasOne returns a single model from the network, if it is not cached');
    xit('hasMany returns a collection of models from the cache');
    xit('hasMany returns a collection models from the network, if they are not cached');
    xit('hasMany returns a partial collection models from the cache, and hits the network for remaining models');
  });

  describe('fetchRelated', function () {
    xit('hasOne returns a single model from the network');
    xit('hasMany returns a collection of models from the network');
  });

  describe('pluckRelated', function () {
    xit('hasOne returns a single model from the cache');
    xit('hasMany returns a collection of models from the cache');
  });

  it('calls pluckByLink and fetch with link in store', function () {
    let id = 2;
    let type = 'foo';
    let link = '/api/test/2/';
    let model = new (Model.extend(RelationalModel))({
      id: 1,
      relationships: {
        test: {
          data: {
            id,
            type
          },
          links: {
            related: link
          }
        }
      }
    });
    let store = getStore();
    model.store = store;
    let spyPluck = sinon.spy(store, 'pluckByTypeId');
    let spyFetch = sinon.spy(store, 'fetch');
    store.register(type, RelationalModel);
    model.getRelated('test');
    sinon.assert.calledWith(spyPluck, type, id);
    sinon.assert.calledWith(spyFetch, link);
  });

  it('calls fetchCollection in repository if collection relation name is passed', function () {
    let link = '/api/tests/';
    let model = new (Model.extend(RelationalModel))({
      id: 1,
      relationships: {
        tests: {
          data: [
            {id: 1, type: 'test'},
            {id: 2, type: 'test'},
            {id: 3, type: 'test'}
          ],
          links: {
            related: link
          }
        }
      }
    });
    let store = getStore();
    model.store = store;
    store.register('test', RelationalModel);
    return model.pluckRelated('tests')
      .then(tests => {
        return assert.equal(tests.length, 3);
      });
  });

  it('calls fetchCollection in repository if collection relation name is passed', function () {
    let link = '/api/tests/';
    let model = new (Model.extend(RelationalModel))({
      id: 1,
      relationships: {
        tests: {
          data: [],
          links: {
            related: link
          }
        }
      }
    });
    let store = getStore();
    model.store = store;
    let spy = sinon.spy(store, 'fetchCollection');
    store.register('test', RelationalModel);
    model.fetchRelated('tests');
    sinon.assert.calledWith(spy, link);
  });

  it('throws exception if related model with this name is not defined', function () {
    let relation = 'notexisting';
    let model = new (Model.extend(RelationalModel))();
    let func = function () {
      model.getRelated(relation);
    };
    assert.throws(func, `Relation for "${relation}" is not defined in the model.`);
  });

  it('throws exception if there\'s no data in relation', function () {
    let relation = 'test';
    let model = new (Model.extend(RelationalModel))();
    let func = function () {
      model.getRelated(relation);
    };
    assert.throws(func, `There is no related model "${relation}".`);
  });

  it('throws exception if link is not set for the collection', function () {
    let relation = 'tests';
    let model = new (Model.extend(RelationalModel))({
      id: 1,
      relationships: {
        tests: {
          id: [1, 2]
        }
      }
    });
    let store = getStore();
    store.register('test', RelationalModel);
    assert.throws(() => model.getRelated(relation));
  });
});
