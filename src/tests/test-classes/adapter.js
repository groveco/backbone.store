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

let resolveWithData = function (id, link, attrs = {}) {
  let args = _.extend({}, data.data, attrs, {
    id: id,
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

let idFromLink = function(link) {
  return link.split('/').filter(item => Boolean(item)).pop();
};

class FakeAdapter {

  get(link) {
    let id = idFromLink(link);
    return resolveWithData(id, link);
  }

  create(link, attributes) {
    let id = 42;
    return resolveWithData(id, link + `${id}/`, attributes);
  }

  update(link, attributes) {
    let id = idFromLink(link);
    return resolveWithData(id, link, attributes);
  }

  destroy(link) {
    return resolve();
  }
}

export default FakeAdapter;