import HttpAdapter from '../src/http-adapter'
import Store from '../src/store'
import sinon from 'sinon'
import Model from '../src/internal-model'

const relationalModel = {
  relationships: {
    foo: 'foo',
    bar: 'bar'
  }
}

let createStore = function () {
  let adapter = new HttpAdapter()
  let store = new Store(adapter)
  store.register('user')
  store.register('pantry')
  store.register('relational', relationalModel)
  return store
}

describe('Store', function () {
  describe('register', function () {
    it('registers model definition', function () {
      let store = createStore()
      let name = 'test'
      let model = {}
      store.register('test', model)
      expect(store._modelDefinitions[name]).toEqual(model)
    })

    it('registers an empty obcject by default', function () {
      let store = createStore()
      let name = 'test'
      store.register('test')
      expect(store._modelDefinitions[name]).toEqual({})
    })
  })

  describe('push', function () {
    it('throws an error if data does not exist', function () {
      let store = createStore()
      expect(() => store.push({})).toThrow('include a top level property `data`')
    })

    it('triggers update when pushing updates to an existing resource', function () {
      let store = createStore()
      let user = store.push({
        data: {
          id: 2,
          type: 'user',
          attributes: {
            name: 'foo'
          }
        }
      })

      let spy = sinon.spy()
      user.on('change', spy)
      user.on('change:name', spy)

      store.push({
        data: {
          id: 2,
          type: 'user',
          attributes: {
            name: 'bar'
          }
        }
      })

      sinon.assert.calledTwice(spy)
      expect(user.get('name')).toEqual('bar')
    })
  })

  describe('get', function () {
    it('adds model to cache on get with type and id', function () {
      let store = createStore()
      let link = '/user/1/'
      let stub = sinon.stub(store._adapter, 'get')

      stub.withArgs('/user/1/').returns(new Promise((resolve) => {
        resolve({
          data: {
            id: 1,
            type: 'user',
            links: {
              self: link
            }
          }
        })
      }))

      return store.get('user', 1)
        .then(() => expect(store._repository._collection.find({_self: link})).toBeDefined())
    })

    it('caches included models as well', function () {
      let store = createStore()
      let pantryLink = '/pantry/42/'
      let stub = sinon.stub(store._adapter, 'get')

      stub.withArgs('/user/1/').returns(new Promise((resolve) => {
        resolve({
          data: null,
          included: [{
            id: 42,
            type: 'pantry',
            attributes: {name: 'bar'},
            links: {self: pantryLink}
          }]
        })
      }))

      return store.get('user', 1)
        .then(() => {
          expect(store._repository._collection.find({_self: pantryLink})).toBeDefined()
        })
    })

    it('adds a collection of models to the cache', function () {
      let store = createStore()
      let stub = sinon.stub(store._adapter, 'get')

      stub.withArgs('/user/1/').returns(new Promise((resolve) => {
        resolve({
          data: [{
            id: 1,
            type: 'user',
            links: {
              self: '/user/1/'
            }
          }, {
            id: 2,
            type: 'user',
            links: {
              self: '/user/2/'
            }
          }]
        })
      }))

      return store.get('user', 1)
        .then(() => {
          expect(store._repository._collection.find({_self: '/user/1/'})).toBeDefined()
          expect(store._repository._collection.find({_self: '/user/2/'})).toBeDefined()
        })
    })
  })

  describe('fetch', function () {
    it('adds model to cache on get with link', function () {
      let store = createStore()
      let link = '/user/1/'
      let stub = sinon.stub(store._adapter, 'get')
      stub.withArgs('/user/1/').returns(new Promise((resolve) => {
        resolve({
          data: {
            id: 1,
            type: 'user',
            links: {
              self: link
            }
          }
        })
      }))

      return store.fetch('user', 1)
        .then(() => {
          expect(store._repository._collection.find({_self: link})).toBeDefined()
        })
    })

    it('caches included models as well', function () {
      let store = createStore()
      let pantryLink = '/pantry/42/'
      let stub = sinon.stub(store._adapter, 'get')
      stub.withArgs('/user/1/').returns(new Promise((resolve) => {
        resolve({
          data: null,
          included: [{
            id: 42,
            type: 'pantry',
            attributes: {name: 'bar'},
            links: {self: pantryLink}
          }]
        })
      }))

      return store.fetch('user', 1)
        .then(() => {
          expect(store._repository._collection.find({_self: pantryLink})).toBeDefined()
        })
    })

    // If we're not careful, the internal wiring of `fetch` will cause global
    // errors that cannot be caught with normal `thennable.catch()` which is
    // annoying and dangerous! So this test runs `fetch` through it's paces
    // and ensures we are returning well behaving promises.
    it('does not fork the thennable chain', function (done) {
      let store = createStore()

      // Force the eventual `fetch` call to fail.
      sinon.stub(store._adapter, 'get', function () {
        return new Promise((_, reject) => {
          reject(new Error('rejected!'))
        })
      })

      let spy = sinon.spy()
      const promise = store.fetch('user', 1)

      return promise
        // If no global errors are triggered, we should still be able to catch
        // the rejection here.
        .catch(() => spy())
        .finally(() => {
          sinon.assert.calledOnce(spy)
          done()
        })
        // Make sure no global errors are being triggered
        .catch(() => {
          throw new Error('Should not be called, there is a problem with the thennable chain')
        })
    })

    xit('returns a single promise instance if previous request has not resolved', function () {
      let store = createStore()
      let resolver
      sinon.stub(store._adapter, 'get', function () {
        return new Promise((resolve, reject) => {
          resolver = {resolve, reject}
        })
      })

      let first = store.fetch('mything')
      let second = store.fetch('mything')
      resolver.resolve()

      let third = store.fetch('mything')
      resolver.resolve()

      return Promise.all([first, second, third]).finally(() => {
        expect(first).toEqual(second)
        expect(first).not.toEqual(third)
      })
    })

    it('updates an existing resource in the store', function () {
      let store = createStore()
      let obj = store.push({
        data: {
          id: 1,
          type: 'user',
          attributes: {
            name: 'foo'
          }
        }
      })

      let objChangeSpy = sinon.spy()
      obj.on('change:name', objChangeSpy)

      let stub = sinon.stub(store._adapter, 'get')
      stub.withArgs('/user/1/').returns(new Promise((resolve) => {
        resolve({
          data: {
            id: 1,
            type: 'user',
            attributes: {
              name: 'bar'
            }
          }
        })
      }))

      return store.fetch('user', 1)
        .then(() => sinon.assert.calledOnce(objChangeSpy))
    })
  })

  describe('peek', function () {
    it('returns a previously cached resource', function () {
      let store = createStore()
      store.push({
        data: {
          id: 1,
          type: 'user',
          links: {
            self: '/user/1/'
          }
        }
      })
      expect(store.peek('user', 1).get('id')).toEqual(1)
    })

    it('returns undefined if the requested resource is not cached', function () {
      let store = createStore()
      expect(store.peek('user', 1)).toBeUndefined()
    })
  })

  describe('build', function () {
    it('returns a new resource', function () {
      let store = createStore()
      let user = store.build('user', {
        name: 'Hello'
      })

      expect(user).toBeInstanceOf(Model)
      expect(user.get('_type')).toEqual('user')
      expect(user.get('name')).toEqual('Hello')
    })

    it('defaults to an empty set of attributes and relationships', function () {
      let store = createStore()
      let user = store.build('user')

      expect(user.attributes).toEqual({_type: 'user', relationships: {}})
    })

    it('defaults to an empty set of declared relationships', function () {
      let store = createStore()
      let user = store.build('relational')

      expect(user.get('relationships')).toEqual({
        foo: {
          data: null
        },
        bar: {
          data: null
        }
      })
    })

    it('empty relationships do not override passed relationships', function () {
      let store = createStore()
      let user = store.build('relational', {
        relationships: {
          foo: {
            data: {
              type: 'foo',
              id: 42
            }
          }
        }
      })

      expect(user.attributes.relationships).toEqual({
        foo: {
          data: {
            type: 'foo',
            id: 42
          }
        },
        bar: {
          data: null
        }
      })
    })

    it('sets the resource id from attributes', function () {
      let store = createStore()
      let user = store.build('user', {id: 4})

      expect(user.get('id')).toEqual(4)
    })
  })

  describe('clone', function () {
    it('creates new model', function () {
      let store = createStore()
      let user = store.build('user', {id: 42, name: 'Hello'})
      let anotherUser = store.clone(user)
      expect(user).not.toEqual(anotherUser)
    })

    it('doesn\'t clone id ans _self', function () {
      let store = createStore()
      let user = store.build('user', {id: 42, _self: 'self://link', name: 'Hello'})
      let anotherUser = store.clone(user)
      expect(anotherUser.get('id')).toBeUndefined()
      expect(anotherUser.get('_self')).toBeUndefined()
    })

    it('clones all flat attributes except id and _self', function () {
      let store = createStore()
      let user = store.build('user', {id: 42, _self: 'self://link', name: 'Hello', slug: 'hello'})
      let anotherUser = store.clone(user)
      Object.keys(user.attributes).forEach((key) => {
        if (key !== 'id' && key !== '_self' && key !== 'relationships') {
          expect(user.get(key)).toBe(anotherUser.get(key))
        }
      })
    })

    it('deep clones nested objects', function () {
      let store = createStore()
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
      })
      let anotherModel = store.clone(model)
      anotherModel.getRelationship('foo').data.id++
      expect(model.getRelationship('foo').data.id).not.toEqual(anotherModel.getRelationship('foo').data.id)
    })

    it('doesn\'t clone relationship links', function () {
      let store = createStore()
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
              self: 'self://link'
            }
          }
        }
      })
      let anotherModel = store.clone(model)
      expect(anotherModel.getRelationship('foo').links).toBeUndefined()
    })
  })

  describe('create', function () {
    it('POSTs a serialized resource', function () {
      let store = createStore()
      let user = store.build('user', {name: 'Hello'})
      sinon.stub(store._adapter, 'create', function () {
        return new Promise((resolve) => {
          resolve({
            data: {
              id: 1,
              type: 'user',
              attributes: {
                name: 'Hello',
                status: 'awesome'
              }
            }
          })
        })
      })

      return store.create(user).then(function (created) {
        expect(user.get('id')).toEqual(1)
        expect(user.get('status')).toEqual('awesome')
        expect(created).toEqual(user)
      })
    })

    it('makes request with a valid request body')
  })

  describe('update', function () {
    it('PATCHes a serialized resource', function () {
      let store = createStore()
      let user = store.build('user', {id: 1, _self: '/api/user/1', name: 'Hello'})
      sinon.stub(store._adapter, 'update', function () {
        return new Promise((resolve) => {
          resolve({
            data: {
              id: 1,
              type: 'user',
              attributes: {
                name: 'Goodbye'
              }
            }
          })
        })
      })

      return store.update(user).then(function (updated) {
        expect(user.get('id')).toEqual(1)
        expect(user.get('name')).toEqual('Goodbye')
        expect(updated).toEqual(user)
      })
    })

    it('only PATCHes dirty attributes')
    it('makes request with a valid request body')
  })

  describe('destroy', function () {
    it('DELETEs a serialized resource', function () {
      let store = createStore()
      let user = store.build('user', {id: 1, _self: '/api/user/1', name: 'Hello'})
      sinon.stub(store._adapter, 'destroy', function () {
        return new Promise((resolve) => {
          resolve()
        })
      })

      return store.destroy(user).then(function (destroyed) {
        expect(user.get('isDeleted')).toBeTruthy()
        expect(destroyed).toEqual(user)
      })
    })

    // maybe this is wrong, maybe the store should simply not return deteled records?
    it('removes a record from the store')
    it('makes request with an empty request body')
  })

  describe('reload', function () {
    it('fetches a single resource')
    it('updates the resource with the response')
  })
})
