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

let resolveWithData = function (link, attrs = {}) {
  let args = _.extend({}, data.data, attrs, {
    _self: link
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

  get(link) {
    return resolveWithData(link);
  }

  create(link, attributes) {
    return resolveWithData(link, attributes);
  }

  update(link, attributes) {
    return resolveWithData(link, attributes);
  }

  destroy(link) {
    return resolve();
  }
}

export default FakeAdapter;