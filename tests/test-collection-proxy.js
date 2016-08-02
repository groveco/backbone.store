import {Collection} from 'backbone';
import CollectionProxy from '../src/collection-proxy';
import RSVP from 'rsvp';
import sinon from 'sinon';

function itProxiesProperty(property) {
  it(`proxies #${property}`, function () {
    let content = new Collection();
    let proxy = new CollectionProxy(content);

    // testing the property with an object to ensure the content is proxied
    // verbatum
    let obj = {};

    content[property] = obj;
    assert.equal(proxy[property], obj, `Property \`${property}\` is not proxying the correct content property`);
  });
}

function itProxiesMethod(method) {
  it(`proxies #${method}()`, function () {
    let content = new Collection();
    content[method] = sinon.spy();

    let proxy = new CollectionProxy(content);
    assert(typeof proxy[method] === 'function', `Method \`${method}\` does not exist`);

    // testing method call with obj and array to ensure all arguments are
    // passed through verbatum
    let obj = {};
    let arr = [];

    proxy[method](obj, arr);

    assert(content[method].calledOnce, `Method \`${method}\` is not proxied to the correct method`);
    assert(content[method].calledWithExactly(obj, arr), `Method \`${method}\` is not passing through all arguments`);
  });
}

describe('CollectionProxy', function () {
  itProxiesProperty('comparator');
  itProxiesProperty('length');
  itProxiesProperty('models');

  itProxiesMethod('at');
  itProxiesMethod('chain');
  itProxiesMethod('contains');
  itProxiesMethod('countBy');
  itProxiesMethod('difference');
  itProxiesMethod('every');
  itProxiesMethod('filter');
  itProxiesMethod('find');
  itProxiesMethod('findIndex');
  itProxiesMethod('findLastIndex');
  itProxiesMethod('findWhere');
  itProxiesMethod('first');
  itProxiesMethod('forEach');
  itProxiesMethod('get');
  itProxiesMethod('groupBy');
  itProxiesMethod('indexBy');
  itProxiesMethod('indexOf');
  itProxiesMethod('initial');
  itProxiesMethod('invoke');
  itProxiesMethod('isEmpty');
  itProxiesMethod('last');
  itProxiesMethod('lastIndexOf');
  itProxiesMethod('map');
  itProxiesMethod('map');
  itProxiesMethod('max');
  itProxiesMethod('min');
  itProxiesMethod('off');
  itProxiesMethod('on');
  itProxiesMethod('once');
  itProxiesMethod('partition');
  itProxiesMethod('pluck');
  itProxiesMethod('pop');
  itProxiesMethod('push');
  itProxiesMethod('reduce');
  itProxiesMethod('reduce');
  itProxiesMethod('reduceRight');
  itProxiesMethod('reject');
  itProxiesMethod('rest');
  itProxiesMethod('sample');
  itProxiesMethod('set');
  itProxiesMethod('shift');
  itProxiesMethod('shuffle');
  itProxiesMethod('size');
  itProxiesMethod('slice');
  itProxiesMethod('some');
  itProxiesMethod('sort');
  itProxiesMethod('sortBy');
  itProxiesMethod('toArray');
  itProxiesMethod('toJSON');
  itProxiesMethod('where');
  itProxiesMethod('without');

  it('sets the content when the promise is resolved', function () {
    let collection = new CollectionProxy(new Collection([{something: 'nothing'}]));
    let deferred = RSVP.defer();
    let resource = new Collection([{something: 'everything'}]);

    collection.promise = deferred.promise;
    deferred.resolve(resource);

    assert.equal(collection.at(0).get('something'), 'nothing');
    return collection.then((result) => {
      assert.equal(result, resource);
      assert.equal(collection.at(0).get('something'), 'everything');
    });
  });

  it('#then is called when the promise resolves', function () {
    let promiseCollection = new CollectionProxy();
    let deferred = RSVP.defer();

    promiseCollection.promise = deferred.promise;
    deferred.resolve('ping');

    return promiseCollection.then(function (message) {
      assert(message);
    });
  });

  it('#catch is called when the promise is rejected', function () {
    let promiseCollection = new CollectionProxy();
    let deferred = RSVP.defer();

    promiseCollection.promise = deferred.promise;
    deferred.reject(new Error('ping'));

    return promiseCollection.catch(function (message) {
      assert(message);
    });
  });

  it('#finally is called when the promise is resolved', function () {
    let promiseCollection = new CollectionProxy();
    let deferred = RSVP.defer();

    promiseCollection.promise = deferred.promise;
    deferred.resolve('ping');
    promiseCollection.catch(() => {});

    return promiseCollection.finally(function () {
      assert(true);
    });
  });

  it('#finally is called when the promise is rejected', function () {
    let promiseCollection = new CollectionProxy();
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
