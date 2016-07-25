import JsonApiParser from '../src/json-api-parser'

let jsonApiData = {
  data: {
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
  }
};

let parsedData = {
  included: [],
  data: {
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
  },
};

let serializedData = {
  data: {
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
  }
};

let jsonApiCollection = {
  data: [{
    id: 1,
    type: 'foo',
    attributes: {
      name: 'foo1'
    },
    links: {
      self: '/api/foo/1/'
    }
  },{
    id: 2,
    type: 'foo',
    attributes: {
      name: 'foo2'
    },
    links: {
      self: '/api/foo/2/'
    }
  }, {
    id: 3,
    type: 'foo',
    attributes: {
      name: 'foo3'
    },
    links: {
      self: '/api/foo/3/'
    }
  }]
};

let parsedCollection = {
  included: [],
  data: [{
    id: 1,
    _type: 'foo',
    name: 'foo1',
    _self: '/api/foo/1/'
  }, {
    id: 2,
    _type: 'foo',
    name: 'foo2',
    _self: '/api/foo/2/'
  }, {
    id: 3,
    _type: 'foo',
    name: 'foo3',
    _self: '/api/foo/3/'
  }],
};

let jsonApiDataIncluded = {
  data: {
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
      }
    }
  },
  included: [{
    id: 42,
    type: 'pantry',
    attributes: {
      name: 'bar'
    },
    links: {
      self: '/api/pantry/42/'
    },
    relationships: {
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
  }]
};

let parsedIncludedData = {
  included: [],
  data: {
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
      }
    }
  },
  included: [{
    name: 'bar',
    id: 42,
    _type: 'pantry',
    _self: '/api/pantry/42/',
    relationships: {
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
  }]
};

let dashData = {
  data: {
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
  }
};

let parsedDashData = {
  included: [],
  data: {
    id: 12,
    _type: 'user',
    firstName: 'foo',
    deep: {
      fooBar: [{
        barFoo: 'foobar'
      }]
    },
    _self: '/api/user/12/'
  },
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

  it('parses collection', function () {
    let parsed = this.parser.parse(jsonApiCollection);
    assert.deepEqual(parsed, parsedCollection);
  });

  it('parses with included', function () {
    let parsed = this.parser.parse(jsonApiDataIncluded);
    assert.deepEqual(parsed, parsedIncludedData);
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
