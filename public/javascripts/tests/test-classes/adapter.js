import $ from 'jquery'

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
  let deferred = $.Deferred();
  let args = $.extend({}, data, attrs);
  args.id = id;
  deferred.resolve(args);
  return deferred;
};

let resolve = function () {
  let deferred = $.Deferred();
  deferred.resolve();
  return deferred;
};

class FakeAdapter {

  getById(id) {
    return resolveWithData(id);
  }

  getByLink(link) {
    return resolveWithData(42);
  }

  create(attributes) {
    return resolveWithData(42, attributes);
  }

  update(id, attributes) {
    return resolveWithData(id, attributes);
  }

  destroy(id) {
    return resolve();
  }
}

export {FakeAdapter};