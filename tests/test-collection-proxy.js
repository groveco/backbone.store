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

  xit('triggers "update" event when the content is changed', function () {
    let collection = new CollectionProxy();
    let spy = sinon.spy();
    collection.on('update', spy);
    collection.content = new Collection();
    sinon.assert.calledOnce(spy);
  });

  it('swaps out event listeners from original content', function () {
    let collection = new CollectionProxy();
    let spy = sinon.spy();
    collection.content = new Collection();
    collection.on('change', spy);

    collection.content.trigger('change');
    sinon.assert.calledOnce(spy);

    collection.content = new Collection();
    collection.content.trigger('change');
    sinon.assert.calledTwice(spy);
  });

  it('tears down the old content events', function () {
    let collection = new CollectionProxy();
    let spy = sinon.spy();
    let content = new Collection();
    collection.content = content;
    collection.on('change', spy);

    collection.content = new Collection();
    content.trigger('change');
    sinon.assert.notCalled(spy);
  });

  it('setting content to null tears down events', function () {
    let collection = new CollectionProxy();
    let spy = sinon.spy();
    let content = new Collection();
    collection.content = content;
    collection.on('change', spy);

    collection.content = null;
    content.trigger('change');
    sinon.assert.notCalled(spy);
  });

  it('events are bound on the proxy level', function () {
    let originalContent = new Collection();
    let newContent = new Collection();
    let collectionA = new CollectionProxy(originalContent);
    let collectionB = new CollectionProxy(originalContent);
    let spyA = sinon.spy();
    let spyB = sinon.spy();

    collectionA.on('change', spyA);
    collectionB.on('change', spyB);
    collectionA.content = newContent;
    collectionA.content.trigger('change');

    sinon.assert.calledOnce(spyA);
    sinon.assert.notCalled(spyB);

    collectionB.content.trigger('change');
    sinon.assert.calledOnce(spyB);
  });

  it('isPending is true when the promise has not been resolved or rejected');
  it('isResolved is true when the promise has been resolved');
  it('isResolved is false when the promise has been rejected');
  it('isRejected is true when the promise has been rejected');
  it('isRejected is false when the promise has been resolved');

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
