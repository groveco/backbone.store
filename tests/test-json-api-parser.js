import JsonApiParser from '../src/json-api-parser';

let jsonApiData = {
  id: 12,
  type: 'user',
  attributes: {
    name: 'foo'
  },
  links: {
    self: '/api/user/12/'
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
};

let parsedData = {
  name: 'foo',
  id: 12,
  _type: 'user',
  _self: '/api/user/12/',
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
};

let serializedData = {
  id: 12,
  type: 'user',
  attributes: {
    name: 'foo'
  },
  links: {
    self: '/api/user/12/'
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
};

let dashData = {
  id: 12,
  type: 'user',
  attributes: {
    'first-name': 'foo',
    deep: {
      'foo-bar': [{
        'bar-foo': 'foobar'
      }]
    }
  },
  links: {
    self: '/api/user/12/'
  }
};

let parsedDashData = {
  id: 12,
  _type: 'user',
  firstName: 'foo',
  deep: {
    fooBar: [{
      barFoo: 'foobar'
    }]
  },
  _self: '/api/user/12/'
};

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

  it('parses with dash attributes', function () {
    let parsed = this.parser.parse(dashData);
    assert.deepEqual(parsed, parsedDashData);
  });

  it('serializes with camelCase attributes', function () {
    let serialized = this.parser.serialize(parsedDashData);
    assert.deepEqual(serialized, dashData);
  });
});
