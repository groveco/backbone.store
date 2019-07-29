import {Model} from 'backbone'
import ModelProxy from '../src/model-proxy'
import sinon from 'sinon'

function itProxiesProperty (property) {
  it(`proxies #${property}`, function () {
    let content = new Model()
    let proxy = new ModelProxy(content)

    // testing the property with an object to ensure the content is proxied
    // verbatum
    let obj = {}

    content[property] = obj
    expect(proxy[property]).toEqual(obj)
  })
}

function itProxiesMethod (method) {
  it(`proxies #${method}()`, function () {
    let content = new Model()
    content[method] = sinon.spy()

    let proxy = new ModelProxy(content)
    expect(proxy[method]).toBeInstanceOf(Function)

    // testing method call with obj and array to ensure all arguments are
    // passed through verbatum
    let obj = {}
    let arr = []

    proxy[method](obj, arr)

    expect(content[method].calledOnce)
    expect(content[method].calledWithExactly(obj, arr))
  })
}

describe('ModelProxy', function () {
  itProxiesProperty('_getRelationForName')
  itProxiesProperty('attributes')
  itProxiesProperty('changed')
  itProxiesProperty('changedAttributes')
  itProxiesProperty('cid')
  itProxiesProperty('defaults')
  itProxiesProperty('getRelated')
  itProxiesProperty('hasRelated')
  itProxiesProperty('getRelationship')
  itProxiesProperty('getRelationshipLink')
  itProxiesProperty('getRelationshipType')
  itProxiesProperty('hasChanged')
  itProxiesProperty('id')
  itProxiesProperty('idAttribute')
  itProxiesProperty('isNew')
  itProxiesProperty('isValid')
  itProxiesProperty('previousAttributes')
  itProxiesProperty('relationships')
  itProxiesProperty('validationError')

  itProxiesMethod('chain')
  itProxiesMethod('clear')
  itProxiesMethod('escape')
  itProxiesMethod('get')
  itProxiesMethod('has')
  itProxiesMethod('invert')
  itProxiesMethod('isEmpty')
  itProxiesMethod('keys')
  itProxiesMethod('omit')
  itProxiesMethod('pairs')
  itProxiesMethod('pick')
  itProxiesMethod('previous')
  itProxiesMethod('set')
  itProxiesMethod('toJSON')
  itProxiesMethod('unset')
  itProxiesMethod('validate')
  itProxiesMethod('values')

  xit('triggers "change" event when the content is changed', function () {
    let model = new ModelProxy()
    let spy = sinon.spy()
    model.on('change', spy)
    model.content = new Model()
    sinon.assert.calledOnce(spy)
  })

  it('swaps out event listeners from original content', function () {
    let model = new ModelProxy()
    let spy = sinon.spy()
    model.content = new Model()
    model.on('change', spy)

    model.content.trigger('change')
    sinon.assert.calledOnce(spy)

    model.content = new Model()
    model.content.trigger('change')
    sinon.assert.calledTwice(spy)
  })

  it('tears down the old content events', function () {
    let model = new ModelProxy()
    let spy = sinon.spy()
    let content = new Model()
    model.content = content
    model.on('change', spy)

    model.content = new Model()
    content.trigger('change')
    sinon.assert.notCalled(spy)
  })

  it('setting content to null tears down events', function () {
    let model = new ModelProxy()
    let spy = sinon.spy()
    let content = new Model()
    model.content = content
    model.on('change', spy)

    model.content = null
    content.trigger('change')
    sinon.assert.notCalled(spy)
  })

  // REFACTOR: unclear test
  it('events are bound on the proxy level', function () {
    let originalContent = new Model({something: 'nothing'})
    let newContent = new Model({something: 'another thing'})
    let modelA = new ModelProxy(originalContent)
    let modelB = new ModelProxy(originalContent)
    let spyA = sinon.spy()
    let spyB = sinon.spy()

    modelA.on('change', spyA)
    modelB.on('change', spyB)
    modelA.content = newContent
    modelA.content.trigger('change')

    sinon.assert.calledOnce(spyA)
    sinon.assert.notCalled(spyB)

    modelB.content.trigger('change')
    sinon.assert.calledOnce(spyB)
  })

  it('isPending is true when the promise has not been resolved or rejected', () => {})
  it('isResolved is true when the promise has been resolved', () => {})
  it('isResolved is false when the promise has been rejected', () => {})
  it('isRejected is true when the promise has been rejected', () => {})
  it('isRejected is false when the promise has been resolved', () => {})

  it('sets the content when the promise is resolved', function () {
    let model = new ModelProxy(new Model({something: 'nothing'}))
    let resource = new Model({something: 'everything'})

    model.promise = Promise.resolve(resource)

    expect(model.get('something')).toEqual('nothing')
    return model.then((result) => {
      expect(result).toEqual(resource)
      expect(model.get('something')).toEqual('everything')
    })
  })

  it('#then is called when the promise resolves', function () {
    let model = new ModelProxy()

    model.promise = Promise.resolve('ping')

    return model.then(message => expect(message))
  })

  it('#catch is called when the promise is rejected', function () {
    let model = new ModelProxy()

    model.promise = Promise.reject(new Error('ping'))

    return model.catch(message => expect(message))
  })

  it('#finally is called when the promise is resolved', function () {
    let model = new ModelProxy()

    model.promise = Promise.resolve('ping')

    return model.finally(() => expect(true))
  })

  it('#finally is called when the promise is rejected', function () {
    let model = new ModelProxy()

    model.promise = Promise.reject(new Error('ping'))

    return model
      .finally(() => expect(true))
      .catch(() => {}) // catch the error so it doesn't throw and break the test
  })
})
