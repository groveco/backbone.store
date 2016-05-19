import _ from 'underscore'
import RSVP from 'rsvp'

let data = {
  data: {
    name: 'foo',
    _type: 'foo',
    relationships: {
      user: {
        data: {
          id: 10,
          type: 'user'
        },
        links: {
          related: '/api/user/10/'
        }
      }
    }
  },
  included: []
};

let resolveWithData = function (id, attrs = {}) {
  let args = _.extend({}, data.data, attrs, {
    id
  });
  return new RSVP.Promise((resolve, reject) => {
    resolve({
      data: args,
      included: []
    });
  });
};

let resolve = function () {
  return new RSVP.Promise((resolve, reject) => {
    resolve();
  });
};

class FakeAdapter {

  getById(modelName, id) {
    return resolveWithData(id);
  }

  getByLink(link) {
    return resolveWithData(42);
  }

  create(modelName, attributes) {
    return resolveWithData(42, attributes);
  }

  update(modelName, id, attributes) {
    return resolveWithData(id, attributes);
  }

  destroy(modelName, id) {
    return resolve();
  }
}

export default FakeAdapter;