import _ from 'underscore'
import Backbone from 'backbone'
import FakeAdapter from './test-classes/adapter';
import Model from './test-classes/model';
import RSVP from 'rsvp'
import Store from '../store';
import UrlResolver from '../url-resolver'

let TestModel = Backbone.Model.extend({});
let modelName = 'foo';

let createStore = function () {
  let adapter = new FakeAdapter();
  let urlResolver = new UrlResolver();
  let store = new Store(adapter, urlResolver);
  store.register(modelName, TestModel);
  return store;
};

describe('Store', function () {

  it('registers model class', function () {
    let store = createStore();
    let name = 'test';
    store.register('test', Model);
    assert.equal(store._modelClasses[name], Model);
  });

  it('calls adapter\'s get method on own get', function () {
    let store = createStore();
    let id = '42';
    let spy = chai.spy.on(store._adapter, 'get');
    store.get(modelName, id);
    let link = store._urlResolver.getUrl(modelName, id);
    spy.should.have.been.called.with(link);
  });

  it('calls adapter\'s get method once on multiple own get', function (done) {
    let store = createStore();
    let modelName = 'foo';
    let id = 1;
    let spy = chai.spy.on(store._adapter, 'get');
    store.get(modelName, id).then(() => {
      store.get(modelName, id);
      spy.should.have.been.called.once();
      done();
    });
  });

  it('calls adapter\'s get method on own getCollection', function () {
    let store = createStore();
    let link = '/api/user/42/';
    let spy = chai.spy.on(store._adapter, 'get');
    store.getCollection(link);
    spy.should.have.been.called.with(link);
  });

  it('calls adapter\'s get method on own fetch', function () {
    let store = createStore();
    let link = '/api/user/42/';
    let spy = chai.spy.on(store._adapter, 'get');
    store.fetch(link);
    spy.should.have.been.called.with(link);
  });

  it('calls adapter\'s get method every time own fetch is called', function () {
    let store = createStore();
    let id = 42;
    let link = '/api/user/42/';
    let spy = chai.spy.on(store._adapter, 'get');
    store.fetch(link).then(() => {
      store.fetch(link);
      spy.should.have.been.called.twice();
    });
  });

  it('doesn\'t call adapter\'s get method on own pluck call', function () {
    let store = createStore();
    let spy = chai.spy.on(store._adapter, 'get');
    store.pluck('/foo');
    spy.should.not.have.been.called();
  });

  it('pluck doesn\'t return not cached data', function () {
    let store = createStore();
    let model = store.pluck('/foo');
    assert.isUndefined(model);
  });
  
  it('calls adapter\'s create method on own create', function () {
    let store = createStore();
    let attrs = {
      name: 'foo'
    };
    let spy = chai.spy.on(store._adapter, 'create');
    store.create(modelName, attrs);
    let link = store._urlResolver.getUrl(modelName);
    spy.should.have.been.called.with(link, attrs);
  });

  it('calls adapter\'s update method on own update', function () {
    let store = createStore();
    let link = '/foo';
    let model = new Backbone.Model({
      id: 42,
      slug: 'bar',
      _self: link
    });
    let attrs = {
      name: 'foo'
    };
    let spy = chai.spy.on(store._adapter, 'update');
    store.update(model, attrs);
    let expected = _.extend({
      id: model.id,
      _type: model.get('_type')
    }, attrs);
    spy.should.have.been.called.with(link, expected);
  });

  it('calls adapter\'s destroy method on own destroy if model is cached', function () {
    let store = createStore();
    let id = 42;
    let type = 'foo';
    let self = '/foo';
    let model = new Backbone.Model({
      id: id,
      _type: type,
      _self: self
    });
    let identifier = store.identifier(modelName, id);
    store._repository.set(identifier, model);
    let spy = chai.spy.on(store._adapter, 'destroy');
    store.destroy(modelName, id);
    spy.should.have.been.called.with(self);
  });

  it('does not call adapter\'s destroy method on own destroy if model is not cached', function () {
    let store = createStore();
    let link = '/foo';
    let spy = chai.spy.on(store._adapter, 'destroy');
    store.destroy(link);
    spy.should.not.have.been.called();
  });

  it('adds model to cache on fetch with link', function (done) {
    let store = createStore();
    let link = '/api/user/1/';
    store.fetch(link).then(() => {
      assert.lengthOf(Object.keys(store._repository._collection), 1);
      done();
    });
  });

  it('adds models to cache on getCollection', function (done) {
    let store = createStore();
    let link = '/api/user/1/';
    let response = {
      data: [{
        id: 1,
        _type: modelName,
        name: 'foo1',
        _self: '/foo/1/'
      }, {
        id: 2,
        _type: modelName,
        name: 'foo2',
        _self: '/foo/2/'
      }, {
        id: 3,
        _type: modelName,
        name: 'foo3',
        _self: '/foo/3/'
      }],
      included: []
    };
    store._adapter.get = function () {
      return new RSVP.Promise((resolve, reject) => {
        resolve(response);
      });
    };
    store.getCollection(link).then(() => {
      assert.lengthOf(Object.keys(store._repository._collection), response.data.length);
      done();
    });
  });

  it('adds model to cache on create', function (done) {
    let store = createStore();
    let link = '/foo';
    let attrs = {
      name: 'foo'
    };
    store.create(modelName, attrs).then(() => {
      assert.lengthOf(Object.keys(store._repository._collection), 1);
      done();
    });
  });

  it('updates model in cache on update', function (done) {
    let store = createStore();
    let link = '/foo';
    let attrs = {
      name: 'foo'
    };
    store.create(modelName, attrs).then((model) => {
      let newAttrs = {
        name: 'foo2'
      };
      store.update(model, newAttrs).then((model) => {
        assert.lengthOf(Object.keys(store._repository._collection), 1);
        let item = store._repository._collection[Object.keys(store._repository._collection)[0]];
        assert.equal(item.get('name'), newAttrs.name);
        done();
      });
    });
  });

  it('removes model from cache on destroy', function (done) {
    let store = createStore();
    let self = '/foo';
    let attrs = {
      _self: self,
      name: 'foo'
    };
    store.create(modelName, attrs).then((model) => {
      store.destroy(model.get('_type'), model.id).then((model) => {
        assert.lengthOf(Object.keys(store._repository._collection), 0);
        done();
      });
    });
  });

  it('caches included models as well', function (done) {
    let store = createStore();
    let userLink = '/api/user/12/';
    let pantryLink = '/api/pantry/42/';
    store._adapter.get = () => {
      return new RSVP.Promise((resolve, reject) => {
        resolve({
          data: {
            id: 12,
            _type: 'user',
            name: 'foo',
            _self: userLink,
            relationships: {
              pantry: {
                data: {
                  id: 42,
                  type: 'pantry'
                },
                links: {
                  related: pantryLink
                }
              }
            }
          },
          included: [{
            id: 42,
            _type: 'pantry',
            name: 'bar',
            _self: pantryLink
          }]
        });
      })
    };
    store.register('user', TestModel);
    store.register('pantry', TestModel);

    store.get(userLink).then((model) => {
      let selfLinks = Object.keys(store._repository._collection).map(key => store._repository._collection[key].get('_self'));
      assert.include(selfLinks, userLink);
      assert.include(selfLinks, pantryLink);
      done();
    });
  });

  it('pluck returns cached data', function (done) {
    let store = createStore();
    let id = '42';
    store.get(modelName, id).then(() => {
      let model = store.pluck(modelName, id);
      assert.isObject(model);
      done();
    });
  });
});