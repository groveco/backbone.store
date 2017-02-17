import HttpAdapter from '../src/http-adapter';
import RSVP from 'rsvp';
import Store from '../src/store';
import sinon from 'sinon';
import Model from '../src/internal-model';

const relationalModel = {
  relationships: {
    foo: 'foo',
    bar: 'bar'
  }
};

let createStore = function () {
  let adapter = new HttpAdapter();
  let store = new Store(adapter);
  store.register('user');
  store.register('pantry');
  store.register('relational', relationalModel);
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

    it('triggers update when pushing updates to an existing resource', function () {
      let store = createStore();
      let user = store.build('user', {
        id: 2,
        name: 'foo'
      });

      let spy = sinon.spy();
      user.on('change', spy);
      user.on('change:name', spy);

      store.push({
        data: {
          id: 2,
          type: 'user',
          attributes: {
            name: 'bar'
          }
        }
      });

      sinon.assert.calledTwice(spy);
      assert.equal(user.get('name'), 'bar');
    });
  });

  describe('get', function () {
    it('adds model to cache on get with type and id', function () {
      let store = createStore();
      let link = '/user/1/';
      let stub = sinon.stub(store._adapter, 'get');

      stub.withArgs('/user/1/').returns(new RSVP.Promise((resolve) => {
        resolve({
          data: {
            id: 1,
            type: 'user',
            links: {
              self: link
            }
          }
        });
      }));

      return store.get('user', 1)
        .then(() => {
          assert.isDefined(store._repository._collection.find({_self: link}));
        });
    });

    it('caches included models as well', function () {
      let store = createStore();
      let pantryLink = '/pantry/42/';
      let stub = sinon.stub(store._adapter, 'get');

      stub.withArgs('/user/1/').returns(new RSVP.Promise((resolve) => {
        resolve({
          data: null,
          included: [{
            id: 42,
            type: 'pantry',
            attributes: {name: 'bar'},
            links: {self: pantryLink}
          }]
        });
      }));

      return store.get('user', 1)
        .then(() => {
          assert.isDefined(store._repository._collection.find({_self: pantryLink}));
        });
    });

    it('adds a collection of models to the cache', function () {
      let store = createStore();
      let stub = sinon.stub(store._adapter, 'get');

      stub.withArgs('/user/1/').returns(new RSVP.Promise((resolve) => {
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
      }));

      return store.get('user', 1)
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
      let stub = sinon.stub(store._adapter, 'get');
      stub.withArgs('/user/1/').returns(new RSVP.Promise((resolve) => {
        resolve({
          data: {
            id: 1,
            type: 'user',
            links: {
              self: link
            }
          }
        });
      }));

      return store.fetch('user', 1)
        .then(() => {
          assert.isDefined(store._repository._collection.find({_self: link}));
        });
    });

    it('caches included models as well', function () {
      let store = createStore();
      let pantryLink = '/pantry/42/';
      let stub = sinon.stub(store._adapter, 'get');
      stub.withArgs('/user/1/').returns(new RSVP.Promise((resolve) => {
        resolve({
          data: null,
          included: [{
            id: 42,
            type: 'pantry',
            attributes: {name: 'bar'},
            links: {self: pantryLink}
          }]
        });
      }));

      return store.fetch('user', 1)
        .then(() => {
          assert.isDefined(store._repository._collection.find({_self: pantryLink}));
        });
    });

    it('does not fork the thennable chain', function (done) {
      let store = createStore();
      sinon.stub(store._adapter, 'get', function () {
        return new RSVP.Promise((_, reject) => {
          reject(new Error('rejected!'));
        });
      });

      RSVP.on('error', () => {
        assert(false, 'Should not be called, there is a problem with the thennable chain');
      });

      setTimeout(done, 100);

      store.fetch('user', 1).promise
        .catch(() => {
          // caught, but don't do anything
        });
    });

    xit('returns a single promise instance if previous request has not resolved', function () {
      let store = createStore();
      let resolver;
      sinon.stub(store._adapter, 'get', function () {
        return new RSVP.Promise((resolve, reject) => resolver = {resolve, reject});
      });


      let first = store.fetch('mything');
      let second = store.fetch('mything');
      resolver.resolve();

      let third = store.fetch('mything');
      resolver.resolve();

      return RSVP.all([first, second, third]).finally(() => {
        assert.equal(first, second);
        assert.notEqual(first, third);
      });
    });

    it('updates an existing resource in the store', function () {
      let store = createStore();
      let obj = store.build('user', {
        id: 1,
        name: 'foo'
      });

      let objChangeSpy = sinon.spy();
      obj.on('change:name', objChangeSpy);

      let stub = sinon.stub(store._adapter, 'get');
      stub.withArgs('/user/1/').returns(new RSVP.Promise((resolve) => {
        resolve({
          data: {
            id: 1,
            type: 'user',
            attributes: {
              name: 'bar'
            }
          },
        });
      }));

      return store.fetch('user', 1)
        .then(() => sinon.assert.calledOnce(objChangeSpy));
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
      assert.equal(store.peek('user', 1).get('id'), 1);
    });

    it('returns undefined if the requested resource is not cached', function () {
      let store = createStore();
      assert.isUndefined(store.peek('user', 1));
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

    it('defaults to an empty set of attributes and relationships', function () {
      let store = createStore();
      let user = store.build('user');

      assert.deepEqual(user.attributes, {id: undefined, _type: 'user', relationships: {}});
    });

    it('defaults to an empty set of declared relationships', function () {
      let store = createStore();
      let user = store.build('relational');

      assert.deepEqual(user.attributes.relationships, {
        foo: {
          data: null
        },
        bar: {
          data: null
        }
      });
    });

    it('empty relationships do not override passed relationships', function () {
      let store = createStore();
      let user = store.build('relational', {
        relationships: {
          foo: {
            data: {
              type: 'foo',
              id: 42
            }
          }
        }
      });

      assert.deepEqual(user.attributes.relationships, {
        foo: {
          data: {
            type: 'foo',
            id: 42
          }
        },
        bar: {
          data: null
        }
      });
    });

    it('sets the resource id from attributes', function () {
      let store = createStore();
      let user = store.build('user', {id: 4});

      assert.deepEqual(user.get('id'), 4);
    });
  });

  describe('clone', function () {
    it('creates new model', function () {
      let store = createStore();
      let user = store.build('user', {id: 42, name: 'Hello'});
      let anotherUser = store.clone(user);
      assert.notEqual(user, anotherUser);
    });

    it('doesn\'t clone id ans _self', function () {
      let store = createStore();
      let user = store.build('user', {id: 42, _self: 'self://link', name: 'Hello'});
      let anotherUser = store.clone(user);
      assert.isUndefined(anotherUser.get('id'));
      assert.isUndefined(anotherUser.get('_self'));
    });

    it('clones all flat attributes except id and _self', function () {
      let store = createStore();
      let user = store.build('user', {id: 42, _self: 'self://link', name: 'Hello', slug: 'hello'});
      let anotherUser = store.clone(user);
      Object.keys(user.attributes).forEach((key) => {
        if (key !== 'id' && key !== '_self' && key !== 'relationships') {
          assert.strictEqual(user.get(key), anotherUser.get(key));
        }
      });
    });

    it('deep clones nested objects', function () {
      let store = createStore();
      let model = store.build('relational', {
        id: 42,
        _self: 'self://link',
        name: 'Hello',
        slug: 'hello',
        relationships: {
          foo: {
            data: {
              id: 22
            }
          }
        }
      });
      let anotherModel = store.clone(model);
      anotherModel.getRelationship('foo').data.id++;
      assert.notEqual(model.getRelationship('foo').data.id, anotherModel.getRelationship('foo').data.id)
    });

    it('doesn\'t clone relationship links', function () {
      let store = createStore();
      let model = store.build('relational', {
        id: 42,
        _self: 'self://link',
        name: 'Hello',
        slug: 'hello',
        relationships: {
          foo: {
            data: {
              id: 22
            },
            links: {
              related: 'related://link',
              self: 'self://link',
            }
          }
        }
      });
      let anotherModel = store.clone(model);
      assert.isUndefined(anotherModel.getRelationship('foo').links)
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

      return store.create(user).then(function(created) {
        assert.equal(user.get('id'), 1);
        assert.equal(user.get('status'), 'awesome');
        assert.equal(created, user);
      });
    });

    it('makes request with a valid request body');
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
    it('makes request with a valid request body');
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
    it('makes request with an empty request body');
  });

  describe('reload', function () {
    it('fetches a single resource');
    it('updates the resource with the response');
  });
});
