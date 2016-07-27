import {Collection} from 'backbone';
import PromiseCollection from '../src/promise-collection';
import RSVP from 'rsvp';

describe('PromiseCollection', function () {
  it('is a collection', function () {
    assert.instanceOf(new PromiseCollection(), Collection);
  });

  it('#then is called when the promise resolves', function () {
    let promiseCollection = new PromiseCollection();
    let deferred = RSVP.defer();

    promiseCollection.promise = deferred.promise;
    deferred.resolve('ping');

    return promiseCollection.then(function (message) {
      assert(message);
    });
  });

  it('#catch is called when the promise is rejected', function () {
    let promiseCollection = new PromiseCollection();
    let deferred = RSVP.defer();

    promiseCollection.promise = deferred.promise;
    deferred.reject(new Error('ping'));

    return promiseCollection.catch(function (message) {
      assert(message);
    });
  });

  it('#finally is called when the promise is resolved', function () {
    let promiseCollection = new PromiseCollection();
    let deferred = RSVP.defer();

    promiseCollection.promise = deferred.promise;
    deferred.resolve('ping');
    promiseCollection.catch(() => {});

    return promiseCollection.finally(function () {
      assert(true);
    });
  });

  it('#finally is called when the promise is rejected', function () {
    let promiseCollection = new PromiseCollection();
    let deferred = RSVP.defer();

    promiseCollection.promise = deferred.promise;
    deferred.reject(new Error('ping'));

    return promiseCollection
      .finally(function () {
        assert(true);
      })
      .catch(() => {}); // catch the error so it doesn't throw and break the test
  });
});
