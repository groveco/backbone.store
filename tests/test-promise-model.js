import {Model} from 'backbone';
import PromiseModel from '../src/promise-model';
import RSVP from 'rsvp';

describe('PromiseModel', function () {
  it('is a model', function () {
    assert.instanceOf(new PromiseModel(), Model);
  });

  it('sets the model attributes when the promise is resolved', function () {
    let model = new PromiseModel({something: 'nothing'});
    let deferred = RSVP.defer();
    let resource = {something: 'everything'};

    model.promise = deferred.promise;
    deferred.resolve(resource);

    return model.then((result) => {
      assert.equal(result, resource);
      assert.equal(model.get('something'), 'everything');
    });
  });

  it('#then is called when the promise resolves', function () {
    let model = new PromiseModel();
    let deferred = RSVP.defer();

    model.promise = deferred.promise;
    deferred.resolve('ping');

    return model.then(message => assert(message));
  });

  it('#catch is called when the promise is rejected', function () {
    let model = new PromiseModel();
    let deferred = RSVP.defer();

    model.promise = deferred.promise;
    deferred.reject(new Error('ping'));

    return model.catch(message => assert(message));
  });

  it('#finally is called when the promise is resolved', function () {
    let model = new PromiseModel();
    let deferred = RSVP.defer();

    model.promise = deferred.promise;
    deferred.resolve('ping');
    model.catch(() => {});

    return model.finally(() => assert(true));
  });

  it('#finally is called when the promise is rejected', function () {
    let model = new PromiseModel();
    let deferred = RSVP.defer();

    model.promise = deferred.promise;
    deferred.reject(new Error('ping'));

    return model
      .finally(() => assert(true))
      .catch(() => {}); // catch the error so it doesn't throw and break the test
  });
});
