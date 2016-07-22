import getStore from './infratructure/get-store'
import Model from '../repository-model';
import RelationalModel from './test-classes/relational-model'

describe('getRelated', function () {
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
    model.store = store
    let spyPluck = chai.spy.on(store, 'pluckByTypeId');
    let spyFetch = chai.spy.on(store, 'fetch');
    store.register(type, RelationalModel);
    model.getRelated('test');
    spyPluck.should.have.been.called.with(type, id);
    spyFetch.should.have.been.called.with(link);
  });

  it('calls getCollection in repository if collection relation name is passed', function () {
    let link = '/api/tests/';
    let model = new (Model.extend(RelationalModel))({
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
    model.store = store
    let spy = chai.spy.on(store, 'getCollection');
    store.register('test', RelationalModel);
    model.fetchRelated('tests');
    spy.should.have.been.called.with(link);
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
    assert.throws(() => model.getRelated(relation))
  });
});
