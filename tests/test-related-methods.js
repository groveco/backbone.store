import HttpAdapter from '../src/http-adapter';
import Store from '../src/store';

let createStore = function () {
  let adapter = new HttpAdapter();
  let store = new Store(adapter);
  store.register('user', {
    relatedModels: {
      bff: 'user',
      friends: 'user',
      enemy: 'two-face'
    }
  });
  return store;
};

let userWithRelationships = {
  data: {
    id: 1,
    type: 'user',
    links: {
      self: '/user/1/'
    },
    relationships: {
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
      }
    }
  },
  included: [{
    id: 2,
    type: 'user',
    links: {
      self: '/user/2/'
    }
  },{
    id: 3,
    type: 'user',
    links: {
      self: '/user/3/'
    }
  }]
};

describe('related methods', function () {
  before(function () {
    let store = createStore();
    this.resource = store.push(userWithRelationships);
  });

  describe('getRelated', function () {
    xit('hasOne returns a single model from the cache');
    xit('hasOne returns a single model from the network, if it is not cached');
    xit('hasMany returns a collection of models from the cache');
    xit('hasMany returns a collection models from the network, if they are not cached');
    xit('hasMany returns a partial collection models from the cache, and hits the network for remaining models');
    xit('hasMany partial collection will resolve to a collection of models');

    it('throws an exception for an unknown relationship', function () {
      assert.throws(() => this.resource.fetchRelated('foo'), 'Relation for "foo" is not defined');
    });

    it('throws an exception for an unregistered relationship type', function () {
      assert.throws(() => this.resource.fetchRelated('enemy'), 'There is no related model');
    });
  });

  describe('fetchRelated', function () {
    xit('hasOne returns a single model from the network');
    xit('hasMany returns a collection of models from the network');

    it('throws an exception for an unknown relationship', function () {
      assert.throws(() => this.resource.fetchRelated('foo'), 'Relation for "foo" is not defined');
    });

    it('throws an exception for an unregistered relationship type', function () {
      assert.throws(() => this.resource.fetchRelated('enemy'), 'There is no related model');
    });
  });

  describe('peekRelated', function () {
    it('hasOne returns a single model from the cache', function () {
      assert.equal(this.resource.peekRelated('bff').get('id'), 2);
    });

    it('hasMany returns a collection of models from the cache', function () {
      assert.equal(this.resource.peekRelated('friends')[0].get('id'), 2);
      assert.equal(this.resource.peekRelated('friends')[1].get('id'), 3);
    });

    it('throws an exception for an unknown relationship', function () {
      assert.throws(() => this.resource.peekRelated('foo'), 'Relation for "foo" is not defined');
    });

    it('throws an exception for an unregistered relationship type', function () {
      assert.throws(() => this.resource.peekRelated('enemy'), 'There is no related model');
    });
  });
});
