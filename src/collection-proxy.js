import _ from 'underscore'
import {Collection, Events} from 'backbone'

/**
 * A Proxy object for a {@link https://backbonejs.org/#Collection Backbone.Collection}. All methods
 * for Backbone Collections are defined for the CollectionProxy
 * class.
 * @param { Collection }
 */
class CollectionProxy {
  constructor (content) {
    if (content == null) {
      content = new Collection()
    }

    this.eventProxy = _.extend({}, Events)
    this.content = content
    this.error = null
    this.promise = new Promise(resolve => resolve(content))
  }

  get content () {
    return this._content
  }

  set content (val) {
    let oldContent = this._content
    if (oldContent !== val) {
      this._content = val
      this._migrateEvents(oldContent)
    }
  }

  get error () {
    return this._error
  }

  set error (val) {
    this._error = val
  }

  _migrateEvents (oldObj) {
    if (oldObj == null) return
    let oldEvents = oldObj._events

    if (oldEvents != null) {
      Object.keys(oldEvents).forEach((name) => {
        let events = _.filter(oldEvents[name], {context: this.eventProxy})
        let callbacks = _.pluck(events, 'callback')
        callbacks.forEach((callback) => this.on(name, callback))
      })
    }

    this.eventProxy.stopListening(oldObj)
  }

  get promise () {
    return this._promise
  }

  set promise (promise) {
    this._promise = promise
    this._promise
      .then(resource => {
        this.error = null
        this.content = resource
        return resource
      })
      .catch(err => {
        this.content = null
        this.error = err
      })
    return promise
  }

  then () {
    return this.promise.then(...arguments)
  }

  catch () {
    return this.promise.catch(...arguments)
  }

  off () { return this.eventProxy.stopListening(this.content, ...arguments) }
  on () { return this.eventProxy.listenTo(this.content, ...arguments) }
  once () { return this.eventProxy.listenToOnce(this.content, ...arguments) }

  //
  // Proxied methods and properties
  //

  get comparator () { return this.content.comparator }
  get length () { return this.content.length }
  get models () { return this.content.models }

  at () { return this.content.at(...arguments) }
  chain () { return this.content.chain(...arguments) }
  contains () { return this.content.contains(...arguments) }
  countBy () { return this.content.countBy(...arguments) }
  difference () { return this.content.difference(...arguments) }
  every () { return this.content.every(...arguments) }
  filter () { return this.content.filter(...arguments) }
  find () { return this.content.find(...arguments) }
  findIndex () { return this.content.findIndex(...arguments) }
  findLastIndex () { return this.content.findLastIndex(...arguments) }
  findWhere () { return this.content.findWhere(...arguments) }
  first () { return this.content.first(...arguments) }
  forEach () { return this.content.forEach(...arguments) }
  get () { return this.content.get(...arguments) }
  groupBy () { return this.content.groupBy(...arguments) }
  indexBy () { return this.content.indexBy(...arguments) }
  indexOf () { return this.content.indexOf(...arguments) }
  initial () { return this.content.initial(...arguments) }
  invoke () { return this.content.invoke(...arguments) }
  isEmpty () { return this.content.isEmpty(...arguments) }
  last () { return this.content.last(...arguments) }
  lastIndexOf () { return this.content.lastIndexOf(...arguments) }
  map () { return this.content.map(...arguments) }
  max () { return this.content.max(...arguments) }
  min () { return this.content.min(...arguments) }
  partition () { return this.content.partition(...arguments) }
  pluck () { return this.content.pluck(...arguments) }
  pop () { return this.content.pop(...arguments) }
  push () { return this.content.push(...arguments) }
  reduce () { return this.content.reduce(...arguments) }
  reduceRight () { return this.content.reduceRight(...arguments) }
  reject () { return this.content.reject(...arguments) }
  rest () { return this.content.rest(...arguments) }
  sample () { return this.content.sample(...arguments) }
  set () { return this.content.set(...arguments) }
  shift () { return this.content.shift(...arguments) }
  shuffle () { return this.content.shuffle(...arguments) }
  size () { return this.content.size(...arguments) }
  slice () { return this.content.slice(...arguments) }
  some () { return this.content.some(...arguments) }
  sort () { return this.content.sort(...arguments) }
  sortBy () { return this.content.sortBy(...arguments) }
  toArray () { return this.content.toArray(...arguments) }
  toJSON () { return this.content.toJSON(...arguments) }
  where () { return this.content.where(...arguments) }
  without () { return this.content.without(...arguments) }
}

export default CollectionProxy
