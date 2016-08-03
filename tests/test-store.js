import HttpAdapter from '../src/http-adapter';
import RSVP from 'rsvp';
import Store from '../src/store';
import sinon from 'sinon';
import Model from '../src/repository-model';

let createStore = function () {
  let adapter = new HttpAdapter();
  let store = new Store(adapter);
  store.register('user');
  store.register('pantry');
  return store;
};

describe('Store', function () {
  describe('register', function () {
    it('registers model definition', function () {
      let store = createStore();
      let name = 'test';
      let model = {};
      store.register('test', model);
      assert.equal(store._modelDefinitions[name], model);
    });

    it('registers an empty obcject by default', function () {
      let store = createStore();
      let name = 'test';
      store.register('test');
      assert.deepEqual(store._modelDefinitions[name], {});
    });
  });

  describe('push', function () {
    it('throws an error if data does not exist', function () {
      let store = createStore();
      assert.throws(() => store.push({}), 'include a top level property `data`');
    });
  });

  describe('get', function () {
    it('adds model to cache on get with link', function () {
      let store = createStore();
      let link = '/user/1/';
      sinon.stub(store._adapter, 'get', function () {
        return new RSVP.Promise((resolve) => {
          resolve({
            data: {
              id: 1,
              type: 'user',
              links: {
                self: link
              }
            }
          });
        });
      });
      return store.get(link)
        .then(() => {
          assert.isDefined(store._repository._collection.find({_self: link}));
        });
    });

    it('caches included models as well', function () {
      let store = createStore();
      let pantryLink = '/pantry/42/';
      sinon.stub(store._adapter, 'get', function () {
        return new RSVP.Promise((resolve) => {
          resolve({
            data: null,
            included: [{
              id: 42,
              type: 'pantry',
              attributes: {name: 'bar'},
              links: {self: pantryLink}
            }]
          });
        });
      });

      return store.get('/')
        .then(() => {
          assert.isDefined(store._repository._collection.find({_self: pantryLink}));
        });
    });

    it('adds a collection of models to the cache', function () {
      let store = createStore();
      sinon.stub(store._adapter, 'get', function () {
        return new RSVP.Promise((resolve) => {
          resolve({
            data: [{
              id: 1,
              type: 'user',
              links: {
                self: '/user/1/'
              }
            },{
              id: 2,
              type: 'user',
              links: {
                self: '/user/2/'
              }
            }]
          });
        });
      });
      return store.get()
        .then(() => {
          assert.isDefined(store._repository._collection.find({_self: '/user/1/'}));
          assert.isDefined(store._repository._collection.find({_self: '/user/2/'}));
        });
    });
  });

  describe('fetch', function () {
    it('adds model to cache on get with link', function () {
      let store = createStore();
      let link = '/user/1/';
      sinon.stub(store._adapter, 'get', function () {
        return new RSVP.Promise((resolve) => {
          resolve({
            data: {
              id: 1,
              type: 'user',
              links: {
                self: link
              }
            }
          });
        });
      });
      return store.fetch(link)
        .then(() => {
          assert.isDefined(store._repository._collection.find({_self: link}));
        });
    });

    it('caches included models as well', function () {
      let store = createStore();
      let pantryLink = '/pantry/42/';
      sinon.stub(store._adapter, 'get', function () {
        return new RSVP.Promise((resolve) => {
          resolve({
            data: null,
            included: [{
              id: 42,
              type: 'pantry',
              attributes: {name: 'bar'},
              links: {self: pantryLink}
            }]
          });
        });
      });

      return store.fetch('/')
        .then(() => {
          assert.isDefined(store._repository._collection.find({_self: pantryLink}));
        });
    });

    xit('returns a single promise instance if previous request has not resolved', function () {
      let link = '/mything';
      let store = createStore();
      let resolver;
      sinon.stub(store._adapter, 'get', function () {
        return new RSVP.Promise((resolve, reject) => resolver = {resolve, reject});
      });


      let first = store.fetch(link);
      let second = store.fetch(link);
      resolver.resolve();

      let third = store.fetch(link);
      resolver.resolve();

      return RSVP.all([first, second, third]).finally(() => {
        assert.equal(first, second);
        assert.notEqual(first, third);
      });
    });
  });

  describe('peek', function () {
    it('returns a previously cached resource', function () {
      let store = createStore();
      store.push({
        data: {
          id: 1,
          type: 'user',
          links: {
            self: '/user/1/'
          }
        }
      });
      assert.equal(store.peek('/user/1/').get('id'), 1);
    });

    it('returns undefined if the requested resource is not cached', function () {
      let store = createStore();
      assert.isUndefined(store.peek('/user/1/'));
    });
  });

  describe('build', function () {
    it('returns a new resource', function () {
      let store = createStore();
      let user = store.build('user', {
        name: 'Hello'
      });

      assert.instanceOf(user, Model);
      assert.equal(user.get('_type'), 'user');
      assert.equal(user.get('name'), 'Hello');
    });

    it('adds the resource to the store', function () {
      let store = createStore();
      let user = store.build('user', {
        name: 'Hello'
      });

      assert.equal(user.store._repository._collection.findWhere({_type: 'user'}), user);
    });
  });

  describe('create', function () {
    it('POSTs a serialized resource', function () {
      let store = createStore();
      let user = store.build('user', {name: 'Hello'});
      sinon.stub(store._adapter, 'create', function () {
        return new RSVP.Promise((resolve) => {
          resolve({
            data: {
              id: 1,
              attributes: {
                name: 'Hello',
                status: 'awesome'
              }
            },
          });
        });
      });

      return store.create('/api/user/', user).then(function(created) {
        assert.equal(user.get('id'), 1);
        assert.equal(user.get('status'), 'awesome');
        assert.equal(created, user);
      });
    });
  });

  describe('update', function () {
    it('PATCHes a serialized resource', function () {
      let store = createStore();
      let user = store.build('user', {id: 1, _self: '/api/user/1', name: 'Hello'});
      sinon.stub(store._adapter, 'update', function () {
        return new RSVP.Promise((resolve) => {
          resolve({
            data: {
              id: 1,
              attributes: {
                name: 'Goodbye'
              }
            },
          });
        });
      });

      return store.update(user).then(function(updated) {
        assert.equal(user.get('id'), 1);
        assert.equal(user.get('name'), 'Goodbye');
        assert.equal(updated, user);
      });
    });

    it('only PATCHes dirty attributes');
    it('updates the resource with the response');
  });

  describe('destroy', function () {
    it('DELETEs a serialized resource', function () {
      let store = createStore();
      let user = store.build('user', {id: 1, _self: '/api/user/1', name: 'Hello'});
      sinon.stub(store._adapter, 'destroy', function () {
        return new RSVP.Promise((resolve) => {
          resolve();
        });
      });

      return store.destroy(user).then(function(destroyed) {
        assert.equal(user.get('isDeleted'), true);
        assert.equal(destroyed, user);
      });
    });

    // maybe this is wrong, maybe the store should simply not return deteled records?
    it('removes a record from the store');
  });

  describe('reload', function () {
    it('fetches a single resource');
    it('updates the resource with the response');
  });
});
