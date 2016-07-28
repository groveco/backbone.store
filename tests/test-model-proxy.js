import {Model} from 'backbone';
import ModelProxy from '../src/model-proxy';
import RSVP from 'rsvp';
import sinon from 'sinon';

function itProxiesProperty(property) {
  it(`proxies #${property}`, function () {
    let content = new Model();
    let proxy = new ModelProxy(content);

    // testing the property with an object to ensure the content is proxied
    // verbatum
    let obj = {};

    content[property] = obj;
    assert.equal(proxy[property], obj, `Property \`${property}\` is not proxying the correct content property`);
  });
}

function itProxiesMethod(method) {
  it(`proxies #${method}()`, function () {
    let content = new Model();
    content[method] = sinon.spy();

    let proxy = new ModelProxy(content);
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

describe('ModelProxy', function () {
  itProxiesProperty('id');
  itProxiesProperty('idAttribute');
  itProxiesProperty('attributes');
  itProxiesProperty('cid');
  itProxiesProperty('changed');
  itProxiesProperty('defaults');
  itProxiesProperty('validationError');
  itProxiesProperty('isValid');
  itProxiesProperty('isNew');
  itProxiesProperty('hasChanged');
  itProxiesProperty('changedAttributes');
  itProxiesProperty('previousAttributes');

  itProxiesMethod('chain');
  itProxiesMethod('clear');
  itProxiesMethod('escape');
  itProxiesMethod('get');
  itProxiesMethod('has');
  itProxiesMethod('invert');
  itProxiesMethod('isEmpty');
  itProxiesMethod('keys');
  itProxiesMethod('omit');
  itProxiesMethod('pairs');
  itProxiesMethod('pick');
  itProxiesMethod('previous');
  itProxiesMethod('set');
  itProxiesMethod('toJSON');
  itProxiesMethod('unset');
  itProxiesMethod('validate');
  itProxiesMethod('values');

  it('sets the content when the promise is resolved', function () {
    let model = new ModelProxy(new Model({something: 'nothing'}));
    let deferred = RSVP.defer();
    let resource = new Model({something: 'everything'});

    model.promise = deferred.promise;
    deferred.resolve(resource);

    assert.equal(model.get('something'), 'nothing');
    return model.then((result) => {
      assert.equal(result, resource);
      assert.equal(model.get('something'), 'everything');
    });
  });

  it('#then is called when the promise resolves', function () {
    let model = new ModelProxy();
    let deferred = RSVP.defer();

    model.promise = deferred.promise;
    deferred.resolve('ping');

    return model.then(message => assert(message));
  });

  it('#catch is called when the promise is rejected', function () {
    let model = new ModelProxy();
    let deferred = RSVP.defer();

    model.promise = deferred.promise;
    deferred.reject(new Error('ping'));

    return model.catch(message => assert(message));
  });

  it('#finally is called when the promise is resolved', function () {
    let model = new ModelProxy();
    let deferred = RSVP.defer();

    model.promise = deferred.promise;
    deferred.resolve('ping');
    model.catch(() => {});

    return model.finally(() => assert(true));
  });

  it('#finally is called when the promise is rejected', function () {
    let model = new ModelProxy();
    let deferred = RSVP.defer();

    model.promise = deferred.promise;
    deferred.reject(new Error('ping'));

    return model
      .finally(() => assert(true))
      .catch(() => {}); // catch the error so it doesn't throw and break the test
  });
});
