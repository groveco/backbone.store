import {Collection} from 'backbone'
import CollectionProxy from '../src/collection-proxy'
import sinon from 'sinon'

function itProxiesProperty (property) {
  it(`proxies #${property}`, function () {
    let content = new Collection()
    let proxy = new CollectionProxy(content)

    // testing the property with an object to ensure the content is proxied
    // verbatum
    let obj = {}

    content[property] = obj
    expect(proxy[property]).toEqual(obj)
  })
}

function itProxiesMethod (method) {
  it(`proxies #${method}()`, function () {
    let content = new Collection()
    content[method] = sinon.spy()

    let proxy = new CollectionProxy(content)
    expect(proxy[method]).toBeInstanceOf(Function)

    // testing method call with obj and array to ensure all arguments are
    // passed through verbatum
    let obj = {}
    let arr = []

    proxy[method](obj, arr)

    expect(content[method].calledOnce).toBeTruthy()
    expect(content[method].calledWithExactly(obj, arr)).toBeTruthy()
  })
}

describe('CollectionProxy', function () {
  itProxiesProperty('comparator')
  itProxiesProperty('length')
  itProxiesProperty('models')

  itProxiesMethod('at')
  itProxiesMethod('chain')
  itProxiesMethod('contains')
  itProxiesMethod('countBy')
  itProxiesMethod('difference')
  itProxiesMethod('every')
  itProxiesMethod('filter')
  itProxiesMethod('find')
  itProxiesMethod('findIndex')
  itProxiesMethod('findLastIndex')
  itProxiesMethod('findWhere')
  itProxiesMethod('first')
  itProxiesMethod('forEach')
  itProxiesMethod('get')
  itProxiesMethod('groupBy')
  itProxiesMethod('indexBy')
  itProxiesMethod('indexOf')
  itProxiesMethod('initial')
  itProxiesMethod('invoke')
  itProxiesMethod('isEmpty')
  itProxiesMethod('last')
  itProxiesMethod('lastIndexOf')
  itProxiesMethod('map')
  itProxiesMethod('map')
  itProxiesMethod('max')
  itProxiesMethod('min')
  itProxiesMethod('partition')
  itProxiesMethod('pluck')
  itProxiesMethod('pop')
  itProxiesMethod('push')
  itProxiesMethod('reduce')
  itProxiesMethod('reduce')
  itProxiesMethod('reduceRight')
  itProxiesMethod('reject')
  itProxiesMethod('rest')
  itProxiesMethod('sample')
  itProxiesMethod('set')
  itProxiesMethod('shift')
  itProxiesMethod('shuffle')
  itProxiesMethod('size')
  itProxiesMethod('slice')
  itProxiesMethod('some')
  itProxiesMethod('sort')
  itProxiesMethod('sortBy')
  itProxiesMethod('toArray')
  itProxiesMethod('toJSON')
  itProxiesMethod('where')
  itProxiesMethod('without')

  xit('triggers "update" event when the content is changed', function () {
    let collection = new CollectionProxy()
    let spy = sinon.spy()
    collection.on('update', spy)
    collection.content = new Collection()
    sinon.assert.calledOnce(spy)
  })

  it('swaps out event listeners from original content', function () {
    let collection = new CollectionProxy()
    let spy = sinon.spy()
    collection.content = new Collection()
    collection.on('change', spy)

    collection.content.trigger('change')
    sinon.assert.calledOnce(spy)

    collection.content = new Collection()
    collection.content.trigger('change')
    sinon.assert.calledTwice(spy)
  })

  it('tears down the old content events', function () {
    let collection = new CollectionProxy()
    let spy = sinon.spy()
    let content = new Collection()
    collection.content = content
    collection.on('change', spy)

    collection.content = new Collection()
    content.trigger('change')
    sinon.assert.notCalled(spy)
  })

  it('setting content to null tears down events', function () {
    let collection = new CollectionProxy()
    let spy = sinon.spy()
    let content = new Collection()
    collection.content = content
    collection.on('change', spy)

    collection.content = null
    content.trigger('change')
    sinon.assert.notCalled(spy)
  })

  it('events are bound on the proxy level', function () {
    let originalContent = new Collection()
    let newContent = new Collection()
    let collectionA = new CollectionProxy(originalContent)
    let collectionB = new CollectionProxy(originalContent)
    let spyA = sinon.spy()
    let spyB = sinon.spy()

    collectionA.on('change', spyA)
    collectionB.on('change', spyB)
    collectionA.content = newContent
    collectionA.content.trigger('change')

    sinon.assert.calledOnce(spyA)
    sinon.assert.notCalled(spyB)

    collectionB.content.trigger('change')
    sinon.assert.calledOnce(spyB)
  })

  it.todo('isPending is true when the promise has not been resolved or rejected')
  it.todo('isResolved is true when the promise has been resolved')
  it.todo('isResolved is false when the promise has been rejected')
  it.todo('isRejected is true when the promise has been rejected')
  it.todo('isRejected is false when the promise has been resolved')

  it('sets the content when the promise is resolved', function () {
    let collection = new CollectionProxy(new Collection([{something: 'nothing'}]))
    let resource = new Collection([{something: 'everything'}])

    collection.promise = Promise.resolve(resource)

    expect(collection.at(0).get('something')).toEqual('nothing')
    return collection.then((result) => {
      expect(result).toEqual(resource)
      expect(collection.at(0).get('something')).toEqual('everything')
    })
  })

  it('#then is called when the promise resolves', function () {
    let promiseCollection = new CollectionProxy()

    promiseCollection.promise = Promise.resolve('ping')

    return promiseCollection.then(function (message) {
      expect(message)
    })
  })

  it('#catch is called when the promise is rejected', function () {
    let promiseCollection = new CollectionProxy()

    promiseCollection.promise = Promise.reject(new Error('pong'))

    return promiseCollection.catch(function (message) {
      expect(message)
    })
  })

  it('#finally is called when the promise is resolved', function () {
    let promiseCollection = new CollectionProxy()

    promiseCollection.promise = Promise.resolve('ping')

    return promiseCollection.finally(function () {
      expect(true)
    })
  })

  it('#finally is called when the promise is rejected', function () {
    let promiseCollection = new CollectionProxy()

    promiseCollection.promise = Promise.reject(new Error('ping'))

    return promiseCollection
      .finally(function () {
        expect(true)
      })
      .catch(() => {}) // catch the error so it doesn't throw and break the test
  })
})
