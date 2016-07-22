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

let resolveWithData = function (link, type, attrs = {}) {
  let args = _.extend({}, data.data, attrs, {
    _self: link
  });
  if (type) {
    args._type = type;
  }
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

  get(link) {
    return resolveWithData(link);
  }

  create(link, type, attributes) {
    return resolveWithData(link, type, attributes);
  }

  update(link, type, attributes) {
    return resolveWithData(link, type, attributes);
  }

  destroy(link) {
    return resolve();
  }
}

export default FakeAdapter;