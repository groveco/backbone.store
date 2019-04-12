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
    const attributes = _.clone(this.attributes)
    const computed = _.mapObject(this.computed, (cp) => cp.call(this))
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

  getRelationshipLink (relationName) {
    const link = _.result(this.getRelationship(relationName), ['links', 'related'])

    if (link == null) {
      throw new Error(`link for, "${relationName}", is undefined for ${this.get('_type')}-${this.id}`)
    }

    return link
  },

  _getRelationForName (relationName) {
    return this.relationships && this.relationships[relationName]
  },

  getRelationship (relationName, strict = true) {
    const modelName = this._getRelationForName(relationName)

    if (modelName == null && strict) {
      if (strict) throw new Error('Relation for "' + relationName + '" is not defined on the model.')

      return null
    }

    const relationship = _.result(this.get('relationships'), relationName)

    if (relationship == null) {
      if (strict) throw new Error('There is no relationship "' + relationName + '" in the resource.')

      return null
    }

    return relationship
  },

  getRelationshipType (relationName) {
    const relationship = _.result(this.getRelationship(relationName), 'data')

    if (_.isArray(relationship)) return 'has-many'

    if (relationship) return 'belongs-to'

    return null
  },

  hasRelated (relationName) {
    const relationship = this.getRelationship(relationName, false)

    return !!_.result(relationship, ['data', 'id'])
  },

  getRelated (relationName, query) {
    const link = this.getRelationshipLink(relationName)

    const related = _.result(this.getRelationship(relationName), 'data')

    if (!related) return this.fetchRelated(relationName, query)

    return _.isArray(related)
      ? this.store.getHasMany(this, link, related, query)
      : this.store.getBelongsTo(this, link, related.type, related.id, query)
  },

  fetchRelated (relationName, query) {
    const link = this.getRelationshipLink(relationName)

    const related = _.result(this.getRelationship(relationName), 'data')

    if (!related) return this.store.fetchUnknown(link, query)

    return (_.isArray(related))
      ? this.store.fetchHasMany(this, null, link, query)
      : this.store.fetchBelongsTo(this, link, related.type, related.id, query)
  },
})
