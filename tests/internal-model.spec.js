import HttpAdapter from '../src/http-adapter'
import sinon from 'sinon'
import Store from '../src/store'
import {Collection} from 'backbone'
import InternalModel from '../src/internal-model'

let createStore = function () {
  let adapter = new HttpAdapter()
  let store = new Store(adapter)
  store.register('user', {
    relationships: {
      so: 'user',
      bff: 'user',
      friends: 'user',
      mother: 'user',
      siblings: 'user',
      allTogetherNow: 'user',
      enemy: 'two-face'
    }
  })
  return store
}

let Jo = {
  id: 4,
  type: 'user',
  attributes: {
    name: 'Jo'
  },
  links: {
    self: '/user/4/'
  }
}
let Riggs = {
  id: 5,
  type: 'user',
  attributes: {
    name: 'Riggs'
  },
  links: {
    self: '/user/5/'
  }
}
let Murtaugh = {
  id: 6,
  type: 'user',
  attributes: {
    name: 'Murtaugh'
  },
  links: {
    self: '/user/6/'
  }
}
let Bonnie = {
  id: 2,
  type: 'user',
  attributes: {
    name: 'Bonnie'
  },
  links: {
    self: '/user/2/'
  }
}
let Clyde = {
  id: 3,
  type: 'user',
  attributes: {
    name: 'Clyde'
  },
  links: {
    self: '/user/3/'
  }
}

let mother = {data: Jo}
let siblings = {data: [Riggs, Murtaugh]}
let allTogetherNow = {data: [Bonnie, Clyde, Jo, Riggs, Murtaugh]}

let userWithRelationships = {
  data: {
    id: 1,
    type: 'user',
    links: {
      self: '/user/1/'
    },
    relationships: {
      so: {
        data: null,
        links: {
          self: '/user/1/relationships/so',
          related: '/user/1/so'
        }
      },
      bff: {
        data: {id: 2, type: 'user'},
        links: {
          self: '/user/1/relationships/bff',
          related: '/user/1/bff'
        }
      },
      friends: {
        data: [
          {id: 2, type: 'user'},
          {id: 3, type: 'user'}
        ],
        links: {
          self: '/user/1/relationships/friends',
          related: '/user/1/friends'
        }
      },
      enemies: {
        data: [],
        links: {
          self: '/user/1/relationships/enemies',
          related: '/user/1/enemies'
        }
      },
      mother: {
        data: {id: 4, type: 'user'},
        links: {
          self: '/user/1/relationships/mother',
          related: '/user/1/mother'
        }
      },
      siblings: {
        data: [
          {id: 5, type: 'user'},
          {id: 6, type: 'user'}
        ],
        links: {
          self: '/user/1/relationships/siblings',
          related: '/user/1/siblings'
        }
      },
      allTogetherNow: {
        data: [
          {id: 2, type: 'user'},
          {id: 3, type: 'user'},
          {id: 4, type: 'user'},
          {id: 5, type: 'user'},
          {id: 6, type: 'user'}
        ],
        links: {
          self: '/user/1/relationships/all-together-now',
          related: '/user/1/all-together-now'
        }
      }
    }
  },
  included: [Bonnie, Clyde]
}

describe('InternalModel', function () {
  it('triggers a change event when a new relationship is added')
  it('peeks a new related resource when a relationship is added')

  describe('toJSON', function () {
    it('returns a hash of all attributes and computed properties', function () {
      let Model = InternalModel.extend({
        computed: {
          amazing: function () {
            return `much more than just ${this.get('something')}`
          }
        }
      })
      let model = new Model({
        something: 'else'
      })

      expect(model.toJSON()).toEqual({
        amazing: 'much more than just else',
        something: 'else'
      })
    })
  })

  describe('attributes', function () {
    it('#get() returns an attributes value', function () {
      let model = new InternalModel({
        amazing: 'boom'
      })

      expect(model.get('amazing')).toEqual('boom')
    })
  })

  describe('computed properties', function () {
    it('#get() returns a computed property', function () {
      let model = new (InternalModel.extend({
        computed: {
          amazing: function () {
            return 'a really random value'
          }
        }
      }))()

      expect(model.get('amazing')).toEqual('a really random value')
    })

    it('are scoped to the model instance', function () {
      let model = new (InternalModel.extend({
        computed: {
          getScope: function () {
            return this
          }
        }
      }))()

      expect(model.get('getScope')).toEqual(model)
    })
  })

  describe('hasRelated', () => {
    let resource
    beforeEach(() => {
      resource = createStore().push(userWithRelationships)
    })

    it('returns true if the relationship exists', () => {
      expect(resource.hasRelated('bff')).toBe(true)
    })

    it('returns true if relationship has a collection of models', () => {
      expect(resource.hasRelated('friends')).toBe(true)
    })

    it('returns false if relationship is empty', () => {
      expect(resource.hasRelated('enemies')).toBe(false)
    })

    it('returns false if the relationship does NOT exist', () => {
      expect(resource.hasRelated('so')).toBe(false)
    })

    it('returns false if the relationship is invalid', () => {
      expect(resource.hasRelated('nada')).toBe(false)
    })
  })

  describe('getRelated', function () {
    let resource, server
    beforeAll(function () {
      server = sinon.fakeServer.create({autoRespond: true})
      server.respondImmediately = true
    })

    beforeEach(function () {
      let store = createStore()
      resource = store.push(userWithRelationships)
    })

    it('hasOne returns a single model from the cache', function () {
      return resource.getRelated('bff')
        .then((bff) => expect(bff.get('name')).toEqual('Bonnie'))
    })

    it('hasOne returns a single model from the network, if it is not cached', function () {
      server.respondWith('GET', '/user/1/mother', JSON.stringify(mother))
      return resource.getRelated('mother')
        .then((mother) => expect(mother.get('name')).toEqual('Jo'))
    })

    it('hasMany returns a collection of models from the cache', function () {
      return resource.getRelated('friends')
        .then((friends) => {
          expect(friends.at(0).get('name')).toEqual('Bonnie')
          expect(friends.at(1).get('name')).toEqual('Clyde')
        })
    })

    it('hasMany returns a collection models from the network, if they are not cached', function () {
      server.respondWith('GET', '/user/1/siblings', JSON.stringify(siblings))
      return resource.getRelated('siblings')
        .then((siblings) => {
          expect(siblings.at(0).get('name')).toEqual('Riggs')
          expect(siblings.at(1).get('name')).toEqual('Murtaugh')
        })
    })

    it('hasMany returns a partial collection models from the cache, and hits the network for remaining models', async () => {
      server.respondWith('GET', '/user/1/all-together-now', JSON.stringify(allTogetherNow))
      let relationship = resource.getRelated('allTogetherNow')
      expect(relationship).toHaveLength(2)
      return expect(relationship).resolves.toHaveLength(5)
    })

    it('hasMany partial collection will resolve to a collection of models', function () {
      server.respondWith('GET', '/user/1/all-together-now', JSON.stringify(allTogetherNow))
      let relationship = resource.getRelated('allTogetherNow')
      expect(relationship.length).toEqual(2)
      return expect(relationship).resolves.toBeInstanceOf(Collection)
    })

    it('throws an exception for an unknown relationship', () => {
      return expect(() => resource.getRelated('foo')).toThrow('Relation for "foo" is not defined')
    })

    it('throws an exception for an undefined relationship type', () => {
      return expect(() => resource.getRelated('unregistered')).toThrow('Relation for "unregistered" is not defined on the model.')
    })

    it('pends request until parent promise has resolved')
  })
})
