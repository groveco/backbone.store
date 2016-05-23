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

  getByLink(link) {
    
    return resolveWithData(link);
  }

  create(modelName, attributes) {
    return resolveWithData(attributes._self, attributes);
  }

  update(modelName, id, attributes) {
    return resolveWithData(id, attributes);
  }

  destroy(modelName, id) {
    return resolve();
  }
}

export default FakeAdapter;