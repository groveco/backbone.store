import JsonApiParser from '../json-api-parser'

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
  data: {
    name: 'foo',
    id: 12,
    _type: 'user',
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
  included: []
};

let serializedData = {
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

let jsonApiCollection = {
  data: [{
    id: 1,
    type: 'foo',
    attributes: {
      name: 'foo1'
    }
  },{
    id: 2,
    type: 'foo',
    attributes: {
      name: 'foo2'
    }
  }, {
    id: 3,
    type: 'foo',
    attributes: {
      name: 'foo3'
    }
  }]
};

let parsedCollection = {
  data: [{
    id: 1,
    _type: 'foo',
    name: 'foo1'
  }, {
    id: 2,
    _type: 'foo',
    name: 'foo2'
  }, {
    id: 3,
    _type: 'foo',
    name: 'foo3'
  }],
  included: []
};

let jsonApiDataIncluded = {
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
      }
    }
  },
  included: [{
    id: 42,
    type: 'pantry',
    attributes: {
      name: 'bar'
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
  data: {
    name: 'foo',
    id: 12,
    _type: 'user',
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
});