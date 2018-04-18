import _ from 'underscore'
import {Events, Model} from 'backbone'
import {Promise} from 'rsvp'

class ModelProxy {
  constructor (content) {
    if (content == null) {
      content = new Model()
    }

    this.eventProxy = _.extend({}, Events)
    this.content = content
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
    return promise
      .then(resource => {
        this.content = resource
        return resource
      })
  }

  then () {
    return this.promise.then(...arguments)
  }

  catch () {
    return this.promise.catch(...arguments)
  }

  finally () {
    return this.promise.finally(...arguments)
  }

  off () { return this.eventProxy.stopListening(this.content, ...arguments) }
  on () { return this.eventProxy.listenTo(this.content, ...arguments) }
  once () { return this.eventProxy.listenToOnce(this.content, ...arguments) }

  //
  // Proxied methods and properties
  //

  get _getRelationForName () { return this.content._getRelationForName }
  get attributes () { return this.content.attributes }
  get changed () { return this.content.changed }
  get changedAttributes () { return this.content.changedAttributes }
  get cid () { return this.content.cid }
  get defaults () { return this.content.defaults }
  get getRelated () { return this.content.getRelated }
  get hasRelated () { return this.content.hasRelated }
  get getRelationship () { return this.content.getRelationship }
  get getRelationshipLink () { return this.content.getRelationshipLink }
  get getRelationshipType () { return this.content.getRelationshipType }
  get hasChanged () { return this.content.hasChanged }
  get id () { return this.content.id }
  get idAttribute () { return this.content.idAttribute }
  get isNew () { return this.content.isNew }
  get isValid () { return this.content.isValid }
  get previousAttributes () { return this.content.previousAttributes }
  get relationships () { return this.content.relationships }
  get validationError () { return this.content.validationError }

  chain () { return this.content.chain(...arguments) }
  clear () { return this.content.clear(...arguments) }
  escape () { return this.content.escape(...arguments) }
  get () { return this.content.get(...arguments) }
  has () { return this.content.has(...arguments) }
  invert () { return this.content.invert(...arguments) }
  isEmpty () { return this.content.isEmpty(...arguments) }
  keys () { return this.content.keys(...arguments) }
  omit () { return this.content.omit(...arguments) }
  pairs () { return this.content.pairs(...arguments) }
  pick () { return this.content.pick(...arguments) }
  previous () { return this.content.previous(...arguments) }
  set () { return this.content.set(...arguments) }
  toJSON () { return this.content.toJSON(...arguments) }
  unset () { return this.content.unset(...arguments) }
  validate () { return this.content.validate(...arguments) }
  values () { return this.content.values(...arguments) }
}

export default ModelProxy
