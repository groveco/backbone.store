import {Model} from 'backbone';
import PromiseModel from '../src/promise-model';
import RSVP from 'rsvp';

describe('PromiseModel', function () {
  it('is a model', function () {
    assert.instanceOf(new PromiseModel(), Model);
  });

  it('#then is called when the promise resolves', function () {
    let promiseCollection = new PromiseModel();
    let deferred = RSVP.defer();

    promiseCollection.promise = deferred.promise;
    deferred.resolve('ping');

    return promiseCollection.then(function (message) {
      assert(message);
    });
  });

  it('#catch is called when the promise is rejected', function () {
    let promiseCollection = new PromiseModel();
    let deferred = RSVP.defer();

    promiseCollection.promise = deferred.promise;
    deferred.reject(new Error('ping'));

    return promiseCollection.catch(function (message) {
      assert(message);
    });
  });

  it('#finally is called when the promise is resolved', function () {
    let promiseCollection = new PromiseModel();
    let deferred = RSVP.defer();

    promiseCollection.promise = deferred.promise;
    deferred.resolve('ping');
    promiseCollection.catch(() => {});

    return promiseCollection.finally(function () {
      assert(true);
    });
  });

  it('#finally is called when the promise is rejected', function () {
    let promiseCollection = new PromiseModel();
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
