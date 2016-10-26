import HttpAdapter from '../src/http-adapter';
import sinon from 'sinon';
import Store from '../src/store';
import {Collection} from 'backbone';
import InternalModel from '../src/internal-model';

let createStore = function () {
  let adapter = new HttpAdapter();
  let store = new Store(adapter);
  store.register('user', {
    relationships: {
      'so': 'user',
      'bff': 'user',
      'friends': 'user',
      'mother': 'user',
      'siblings': 'user',
      'all-together-now': 'user',
      'enemy': 'two-face'
    }
  });
  return store;
};

let Jo = {
  id: 4,
  type: 'user',
  attributes: {
    name: 'Jo'
  },
  links: {
    self: '/user/4/'
  }
};
let Riggs = {
  id: 5,
  type: 'user',
  attributes: {
    name: 'Riggs'
  },
  links: {
    self: '/user/5/'
  }
};
let Murtaugh = {
  id: 6,
  type: 'user',
  attributes: {
    name: 'Murtaugh'
  },
  links: {
    self: '/user/6/'
  }
};
let Bonnie = {
  id: 2,
  type: 'user',
  attributes: {
    name: 'Bonnie'
  },
  links: {
    self: '/user/2/'
  }
};
let Clyde = {
  id: 3,
  type: 'user',
  attributes: {
    name: 'Clyde'
  },
  links: {
    self: '/user/3/'
  }
};

let mother = {data: Jo};
let siblings = {data: [Riggs, Murtaugh]};
let allTogetherNow = {data: [Bonnie, Clyde, Jo, Riggs, Murtaugh]};

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
          {id: 3, type: 'user'},
        ],
        links: {
          self: '/user/1/relationships/friends',
          related: '/user/1/friends'
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
      'all-together-now': {
        data: [
          {id: 2, type: 'user'},
          {id: 3, type: 'user'},
          {id: 4, type: 'user'},
          {id: 5, type: 'user'},
          {id: 6, type: 'user'},
        ],
        links: {
          self: '/user/1/relationships/all-together-now',
          related: '/user/1/all-together-now'
        }
      }
    }
  },
  included: [Bonnie, Clyde]
};

describe('InternalModel', function () {
  it('triggers a change event when a new relationship is added');
  it('peeks a new related resource when a relationship is added');

  describe('toJSON', function () {
    it('returns a hash of all attributes and computed properties', function () {
      let Model = InternalModel.extend({
        computed: {
          amazing: function () {
            return `much more than just ${this.get('something')}`;
          }
        }
      });
      let model = new Model({
        something: 'else'
      });

      assert.deepEqual(model.toJSON(), {
        amazing: 'much more than just else',
        something: 'else'
      });
    });
  });

  describe('attributes', function () {
    it('#get() returns an attributes value', function () {
      let model = new InternalModel({
        amazing: 'boom'
      });

      assert.equal(model.get('amazing'), 'boom');
    });
  });

  describe('computed properties', function () {
    it('#get() returns a computed property', function () {
      let model = new (InternalModel.extend({
        computed: {
          amazing: function () {
            return 'a really random value';
          }
        }
      }))();

      assert.equal(model.get('amazing'), 'a really random value');
    });

    it('are scoped to the model instance', function () {
      let model = new (InternalModel.extend({
        computed: {
          getScope: function () {
            return this;
          }
        }
      }))();

      assert.equal(model.get('getScope'), model);
    });
  });

  describe('hasRelated', function () {
    beforeEach(function () {
      let store = createStore();
      this.resource = store.push(userWithRelationships);
    });

    it('returns true if the relationship is exists', function () {
      return assert.equal(this.resource.hasRelated('bff'), true);
    });

    it('returns false if the relationship is exists', function () {
      return assert.equal(this.resource.hasRelated('so'), false);
    });
  });

  describe('getRelated', function () {
    before(function () {
      this.server = sinon.fakeServer.create({autoRespond: true});
      this.server.respondImmediately = true;
    });

    beforeEach(function () {
      let store = createStore();
      this.resource = store.push(userWithRelationships);
    });

    it('hasOne returns a single model from the cache', function () {
      return this.resource.getRelated('bff')
        .then((bff) => assert.equal(bff.get('name'), 'Bonnie'));
    });

    it('hasOne returns a single model from the network, if it is not cached', function () {
      this.server.respondWith('GET', '/user/1/mother', JSON.stringify(mother));
      return this.resource.getRelated('mother')
        .then((mother) => assert.equal(mother.get('name'), 'Jo'));
    });

    it('hasMany returns a collection of models from the cache', function () {
      return this.resource.getRelated('friends')
        .then((friends) => {
          assert.equal(friends.at(0).get('name'), 'Bonnie');
          assert.equal(friends.at(1).get('name'), 'Clyde');
        });
    });

    it('hasMany returns a collection models from the network, if they are not cached', function () {
      this.server.respondWith('GET', '/user/1/siblings', JSON.stringify(siblings));
      return this.resource.getRelated('siblings')
        .then((siblings) => {
          assert.equal(siblings.at(0).get('name'), 'Riggs');
          assert.equal(siblings.at(1).get('name'), 'Murtaugh');
        });
    });

    it('hasMany returns a partial collection models from the cache, and hits the network for remaining models', function () {
      this.server.respondWith('GET', '/user/1/all-together-now', JSON.stringify(allTogetherNow));
      let relationship = this.resource.getRelated('all-together-now');
      assert.equal(relationship.length, 2);
      return relationship
        .then(() => assert.equal(relationship.length, 5));
    });

    it('hasMany partial collection will resolve to a collection of models', function () {
      this.server.respondWith('GET', '/user/1/all-together-now', JSON.stringify(allTogetherNow));
      let relationship = this.resource.getRelated('all-together-now');
      assert.equal(relationship.length, 2);
      return relationship
        .then((rest) => assert.instanceOf(rest, Collection));
    });

    it('throws an exception for an unknown relationship', function () {
      assert.throws(() => this.resource.getRelated('foo'), 'Relation for "foo" is not defined');
    });

    it('throws an exception for an unregistered relationship type', function () {
      assert.throws(() => this.resource.getRelated('enemy'), 'There is no related model');
    });

    it('pends request until parent promise has resolved');
  });
});