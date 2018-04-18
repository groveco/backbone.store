import JsonApiParser from '../src/json-api-parser'

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
}

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
}

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
}

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
  relationships: {
    'dashed-relationship': {
      id: 11,
      type: 'dashed-relationship'
    }
  },
  links: {
    self: '/api/user/12/'
  }
}

let parsedDashData = {
  id: 12,
  _type: 'user',
  firstName: 'foo',
  deep: {
    fooBar: [{
      barFoo: 'foobar'
    }]
  },
  relationships: {
    dashedRelationship: {
      id: 11,
      type: 'dashed-relationship'
    }
  },
  _self: '/api/user/12/'
}

describe('JSON API parser', () => {
  let parser

  beforeAll(() => {
    parser = new JsonApiParser()
  })

  it('parses data', () => {
    let parsed = parser.parse(jsonApiData)
    expect(parsed).toEqual(parsedData)
  })

  it('serializes data', () => {
    let serialized = parser.serialize(parsedData)
    expect(serialized).toEqual(serializedData)
  })

  it('parses with dash attributes', () => {
    let parsed = parser.parse(dashData)
    expect(parsed).toEqual(parsedDashData)
  })

  it('serializes with camelCase attributes', () => {
    let serialized = parser.serialize(parsedDashData)
    expect(serialized).toEqual(dashData)
  })
})
