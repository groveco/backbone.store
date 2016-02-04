import {JsonApiParser} from '../json-api-parser'

let jsonApiData = {
  data: {
    id: 12,
    type: 'user',
    attributes: {
      name: 'foo'
    },
    relationships: {
      pantry: {
        data: {
          id: 42,
          type: 'pantry'
        },
        links: {
          related: '/api/pantry/42'
        }
      },
      addresses: {
        data: [
          {
            id: 1,
            type: 'address'
          }, {
            id: 2,
            type: 'address'
          }, {
            id: 3,
            type: 'address'
          }
        ],
        links: {
          related: '/api/address'
        }
      }
    }
  }
};

let parsedData = {
  name: 'foo',
  id: 12,
  relationships: {
    pantry: {
      id: 42,
      link: '/api/pantry/42'
    },
    addresses: {
      id: [1, 2, 3],
      link: '/api/address'
    }
  }
};

let serializedData = {
  data: {
    id: 12,
    attributes: {
      name: 'foo'
    },
    relationships: {
      pantry: {
        data: {
          id: 42
        }
      },
      addresses: {
        data: [
          {
            id: 1
          }, {
            id: 2
          }, {
            id: 3
          }
        ]
      }
    }
  }
};

let jsonApiCollection = {
  data: [{
    id: 1,
    attributes: {
      name: 'foo1'
    }
  },{
    id: 2,
    attributes: {
      name: 'foo2'
    }
  }, {
    id: 3,
    attributes: {
      name: 'foo3'
    }
  }]
};

let parsedCollection = [{
  id: 1,
  name: 'foo1'
}, {
  id: 2,
  name: 'foo2'
}, {
  id: 3,
  name: 'foo3'
}];

describe('JSON API parser', () => {

  before(function () {
    this.parser = new JsonApiParser();
  });

  it('parses data', function () {
    let parsed = this.parser.parse(jsonApiData);
    assert.deepEqual(parsed, parsedData);
  });

  it('serializes data', function () {
    let serialized = this.parser.serialize(parsedData);
    assert.deepEqual(serialized, serializedData);
  });

  it('parses collection', function () {
    let parsed = this.parser.parse(jsonApiCollection);
    assert.deepEqual(parsed, parsedCollection);
  });
});