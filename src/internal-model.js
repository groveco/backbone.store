import _ from 'underscore'
import { Model } from 'backbone'

function attributesWithDefaults (attributes, defaults) {
  return _.defaults(_.extend({}, defaults, attributes), defaults)
}

/**
 * Exports a Backbone model extended with utility methods that enables the
 * retrieval of data based on {@link https://jsonapi.org/ JSON:API} formatted responses
 * @module internal-model
 */
export default Model.extend({
  /**
   * Constructs a Backbone Model with the given attributes passed to it
   * @param {Object} attributes - Object with attributes
   */
  constructor: function (attributes) {
    _.defaults(this, {
      defaults: { },
      attributes: { },
      computed: { },
      changed: { }
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

  /**
   * Get the relationship's {@link https://jsonapi.org/format/#document-resource-object-relationships resource object}
   * from the {@link https://jsonapi.org/ JSON:API} response. If the given `relationName` does not
   * exist or the relationship object returned is null, then an
   * exception is thrown. Otherwise, the relationship object for the
   * given `relationName` is returned
   * @param {String} relationName - The name of a given resource found within the response's relationship's object
   * @param {Boolean} strict - A boolean indicating whether method is ran in strict mode.
   * @returns {Object} - The relationships object from the {@link https://jsonapi.org/ JSON:API}
   */
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

  getRelationshipData (relationName, strict = true) {
    return _.result(this.getRelationship(relationName, strict), 'data')
  },

  getRelationshipType (relationName) {
    const relationship = this.getRelationshipData(relationName)

    if (_.isArray(relationship)) return 'has-many'

    if (relationship) return 'belongs-to'

    return null
  },

  /**
   * Check if the given relation exists
   * @param {string} relationName - The name of a registered Model in a responses relationship
   * @returns {Boolean} true if relationship exists
   */
  hasRelated (relationName) {
    return !_.isEmpty(this.getRelationshipData(relationName, false))
  },

  /**
   * Get a stores related model. Will return the model in the cache
   * if it has already been fetched. If not, then we fetch the response
   * from the server
   * @param {string} relationName - The name of a registered Model in a responses relationship
   * @param {Object} queryObj - An object that will have it's key:value pairs converted to a
   * query string.
   * @returns { CollectionProxy | ModelProxy }
   */
  getRelated (relationName, queryObj) {
    const link = this.getRelationshipLink(relationName)

    const related = this.getRelationshipData(relationName)

    if (!related) return this.fetchRelated(relationName, queryObj)

    return _.isArray(related)
    ? this.store.getHasMany(this, link, related, queryObj)
    : this.store.getBelongsTo(this, link, related.type, related.id, queryObj)
  },

  /**
   * Fetch a stores related model from the server.
   * @param {string} relationName - The name of a registered Model in a responses relationship
   * @param {Object} queryObj - An object that will have it's key:value pairs converted to a
   * query string.
   * @returns { CollectionProxy | ModelProxy }
   */
  fetchRelated (relationName, queryObj) {
    const link = this.getRelationshipLink(relationName)

    const related = this.getRelationshipData(relationName)

    if (!related) return this.store.fetchUnknown(link, queryObj)

    return (_.isArray(related))
    ? this.store.fetchHasMany(this, null, link, queryObj)
    : this.store.fetchBelongsTo(this, link, related.type, related.id, queryObj)
  }
})
