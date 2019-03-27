import _ from 'underscore'
import { Model } from 'backbone'

function attributesWithDefaults(attributes, defaults) {
  return _.defaults(_.extend({}, defaults, attributes), defaults)
}

export default Model.extend({
  constructor: function (attributes) {
    _.defaults(this, {
      defaults: { },
      attributes: { },
      computed: { },
      changed: { },
    })

    _.extend(this, {
      cid: _.uniqueId(this.cidPrefix)
    })

    const defaults = _.result(this, 'defaults')

    this.set(attributesWithDefaults(attributes, defaults))

    this.initialize.apply(this, arguments)
  },

  toJSON () {
    let attributes = _.clone(this.attributes)
    let computed = _.mapObject(this.computed, (cp) => cp.call(this))
    return _.extend(attributes, computed)
  },

  /**
   * {Backbone.Model} does not provide "computed" properties.
   *
   * @param {string} attr name
   * @return {mixed|undefined} via {attributes[attr]} or {computed[attr]}
   */
  get (attr) {
    if (this.attributes.hasOwnProperty(attr)) return this.attributes[attr]

    if (this.computed.hasOwnProperty(attr)) return this.computed[attr].call(this)

    return undefined
  },

  getRelationshipType (relationName) {
    let relationship = this.getRelationship(relationName)
    if (_.isArray(relationship.data)) {
      return 'has-many'
    } else if (relationship.data) {
      return 'belongs-to'
    } else {
      return 'unknown'
    }
  },

  getRelationshipLink (relationName) {
    let link = this.getRelationship(relationName).links.related
    if (link == null) {
      throw new Error(`link for, "${relationName}", is undefined for ${this.get('_type')}-${this.id}`)
    }
    return link
  },

  getRelationship (relationName) {
    let modelName = this._getRelationForName(relationName)
    if (modelName == null) {
      throw new Error('Relation for "' + relationName + '" is not defined on the model.')
    }

    let relationship = this.get('relationships') && this.get('relationships')[relationName]
    if (relationship == null) {
      throw new Error('There is no relationship "' + relationName + '" in the resource.')
    }

    return relationship
  },

  hasRelated (relationName) {
    const relationship = this.getRelationship(relationName)
    return !!(relationship && relationship.data && relationship.data.id)
  },

  getRelated (relationName, query) {
    let link = this.getRelationshipLink(relationName)
    let relType = this.getRelationshipType(relationName)

    if (relType === 'unknown') {
      return this.fetchRelated(relationName, query)
    } else if (relType === 'has-many') {
      let data = this.getRelationship(relationName).data
      return this.store.getHasMany(this, link, data, query)
    } else {
      let {type, id} = this.getRelationship(relationName).data
      return this.store.getBelongsTo(this, link, type, id, query)
    }
  },

  fetchRelated (relationName, query) {
    let link = this.getRelationshipLink(relationName)
    let relType = this.getRelationshipType(relationName)

    if (relType === 'unknown') {
      return this.store.fetchUnknown(link, query)
    } else if (relType === 'has-many') {
      return this.store.fetchHasMany(this, null, link, query)
    } else {
      let {type, id} = this.getRelationship(relationName).data
      return this.store.fetchBelongsTo(this, link, type, id, query)
    }
  },

  _getRelationForName (relationName) {
    return this.relationships && this.relationships[relationName]
  }
})

