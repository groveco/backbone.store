import _ from 'underscore'
import Backbone from 'backbone'
import FakeAdapter from './test-classes/adapter';
import Model from './test-classes/model';
import RSVP from 'rsvp'
import Store from '../store';

let TestModel = Backbone.Model.extend({});
let TestCollection = Backbone.Collection.extend({
  model: TestModel
});
let modelName = 'foo';

describe('Store', function () {

  beforeEach(function () {
    let adapter = new FakeAdapter();
    this.store = new Store(adapter);
    this.store.register(modelName, TestCollection);
  });

  it('registers repository', function () {
    let name = 'test';
    this.store.register('test', Model);
    assert(this.store._repositories[name]);
    assert.equal(this.store._repositories[name].modelClass, Model);
  });

  it('calls adapter\'s getByLink method on own get with link', function () {
    let link = '/api/user/42/';
    let spy = chai.spy.on(this.store._adapter, 'getByLink');
    this.store.get(modelName, link);
    spy.should.have.been.called.with(link);
  });

  it('calls adapter\'s getByLink method once on multiple own get with link', function (done) {
    let link = '/foo';
    let spy = chai.spy.on(this.store._adapter, 'getByLink');
    this.store.get(modelName, link).then(() => {
      this.store.get(modelName, link);
      spy.should.have.been.called.once();
      done();
    });
  });

  it('calls adapter\'s getByLink method on own getCollection', function () {
    let link = '/api/user/42/';
    let spy = chai.spy.on(this.store._adapter, 'getByLink');
    this.store.getCollection(link);
    spy.should.have.been.called.with(link);
  });

  it('calls adapter\'s getByLink method on own fetch with link', function () {
    let link = '/api/user/42/';
    let spy = chai.spy.on(this.store._adapter, 'getByLink');
    this.store.fetch(link);
    spy.should.have.been.called.with(link);
  });

  it('calls adapter\'s getByLink method every time own fetch with link is called', function () {
    let id = 42;
    let link = '/api/user/42/';
    let spy = chai.spy.on(this.store._adapter, 'getByLink');
    this.store.fetch(modelName, id, link).then(() => {
      this.store.fetch(modelName, id, link);
      spy.should.have.been.called.twice();
    });
  });

  it('doesn\'t call any adapter\'s get method on own pluck call', function () {
    let spyByLink = chai.spy.on(this.store._adapter, 'getByLink');
    let spyById = chai.spy.on(this.store._adapter, 'getById');
    this.store.pluck(modelName, 42);
    spyByLink.should.not.have.been.called();
    spyById.should.not.have.been.called();
  });

  it('pluck doesn\'t return not cached data', function () {
    let model = this.store.pluck(modelName, '/foo');
    assert.isUndefined(model);
  });
  
  it('calls adapter\'s create method on own create', function () {
    let attrs = {
      name: 'foo'
    };
    let spy = chai.spy.on(this.store._adapter, 'create');
    this.store.create(modelName, attrs);
    spy.should.have.been.called.with(modelName, attrs);
  });

  it('calls adapter\'s update method on own update', function () {
    let model = new Backbone.Model({
      id: 42,
      slug: 'bar'
    });
    let initialAttrs = model.toJSON();
    let attrs = {
      name: 'foo'
    };
    let spy = chai.spy.on(this.store._adapter, 'update');
    this.store.update(modelName, model, attrs);
    _.extend(initialAttrs, attrs);
    spy.should.have.been.called.with(modelName, model.id, initialAttrs);
  });

  it('calls adapter\'s destroy method on own destroy if model is cached', function () {
    let id = 42;
    let self = '/foo';
    let model = new Backbone.Model({
      id: id,
      _self: self
    });
    this.store._repositories[modelName].set(model);
    let spy = chai.spy.on(this.store._adapter, 'destroy');
    this.store.destroy(modelName, self);
    spy.should.have.been.called.with(modelName, self);
  });

  it('does not call adapter\'s destroy method on own destroy if model is not cached', function () {
    let id = 42;
    let spy = chai.spy.on(this.store._adapter, 'destroy');
    this.store.destroy(modelName, id);
    spy.should.not.have.been.called();
  });

  it('adds model to cache on get with link', function (done) {
    let link = '/api/user/1/';
    this.store.get(modelName, link).then(() => {
      assert.lengthOf(this.store._repositories[modelName]._collection, 1);
      done();
    });
  });

  it('adds models to cache on getCollection', function (done) {
    let link = '/api/user/1/';
    let response = {
      data: [{
        id: 1,
        _type: modelName,
        name: 'foo1'
      }, {
        id: 2,
        _type: modelName,
        name: 'foo2'
      }, {
        id: 3,
        _type: modelName,
        name: 'foo3'
      }],
      included: []
    };
    this.store._adapter.getByLink = function () {
      return new RSVP.Promise((resolve, reject) => {
        resolve(response);
      });
    };
    this.store.getCollection(modelName, link).then(() => {
      assert.lengthOf(this.store._repositories[modelName]._collection, response.data.length);
      done();
    });
  });

  it('adds model to cache on create', function (done) {
    let attrs = {
      name: 'foo'
    };
    this.store.create(modelName, attrs).then(() => {
      assert.lengthOf(this.store._repositories[modelName]._collection, 1);
      done();
    });
  });

  it('updates model in cache on update', function (done) {
    let attrs = {
      name: 'foo'
    };
    this.store.create(modelName, attrs).then((model) => {
      let newAttrs = {
        name: 'foo2'
      };
      this.store.update(modelName, model, newAttrs).then((model) => {
        assert.lengthOf(this.store._repositories[modelName]._collection, 1);
        assert.equal(this.store._repositories[modelName]._collection.at(0).get('name'), newAttrs.name);
        done();
      });
    });
  });

  it('removes model from cache on destroy', function (done) {
    let self = '/foo';
    let attrs = {
      _self: self,
      name: 'foo'
    };
    this.store.create(modelName, attrs).then((model) => {
      this.store.destroy(modelName, self).then((model) => {
        assert.lengthOf(this.store._repositories[modelName]._collection, 0);
        done();
      });
    });
  });

  it('caches included models as well', function (done) {
    let userLink = '/api/user/12/';
    let pantryLink = '/api/pantry/42/';
    this.store._adapter.getByLink = () => {
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
                  related: '/api/pantry/42'
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
    this.store.register('user', TestCollection);
    this.store.register('pantry', TestCollection);

    this.store.get('user', userLink).then(() => {
      assert.include(this.store._repositories['user']._collection.pluck('id'), 12);
      assert.include(this.store._repositories['pantry']._collection.pluck('id'), 42);
      done();
    });
  });

  it('pluck returns cached data', function (done) {
    let link = '/api/user/42/';
    this.store.get(modelName, link).then(() => {
      let model = this.store.pluck(modelName, link);
      assert.isObject(model);
      done();
    });
  });
});