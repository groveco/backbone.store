import assert from 'assert';
import {JsonApiParser} from '../json-api-parser'

let jsonApiData = {
  data: {
    id: 12,
    type: 'user',
    attributes: {
      name: 'foo'
    },
    relationships: {
      'pantry': {
        data: {
          id: 42,
          type: 'pantry'
        },
        links: {
          related: '/api/pantry/42'
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
      'pantry': {
        data: {
          id: 42
        }
      }
    }
  }
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
});