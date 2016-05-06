import _ from 'underscore'
import RSVP from 'rsvp'

let data = {
  name: 'foo',
  relationships: {
    user: {
      id: 10,
      link: '/api/user/10/'
    }
  }
};

let resolveWithData = function (id, attrs = {}) {
  let args = _.extend({}, data, attrs, {
    id
  });
  return new RSVP.Promise((resolve, reject) => {
    resolve(args);
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