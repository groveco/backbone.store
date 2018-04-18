/**
 * JsonApiParser.
 * @module
 */
import _ from 'underscore'
import {camelize, decamelize} from './camelcase-dash'

/**
 * Parser that parses a resource in JSON API format to BackboneStore format.
 */
class JsonApiParser {
  /**
   * Parses a resource from JSON API format to BackboneStore format.
   * @param {object} resource - Data in JSON API format.
   * @returns {object} Data in BackboneStore format.
   */
  parse (resource) {
    let result = {}
    if (resource.attributes) {
      _.extend(result, resource.attributes)
    }
    result.id = resource.id
    result._type = resource.type
    if (resource.links && resource.links.self) {
      result._self = resource.links.self
    }
    if (resource.relationships) {
      result.relationships = resource.relationships
    }

    return this._parseWithNames(result)
  }

  /**
   * Serializes a resource from BackboneStore format to JSON API format.
   * @param {object} obj - Data in BackboneStore format.
   * @returns {object} Data in JSON API format.
   */
  serialize (obj) {
    let result = {
      id: obj.id,
      type: obj._type,
      attributes: {}
    }
    if (obj._self) {
      result.links = {
        self: obj._self
      }
    }
    if (obj.relationships) {
      result.relationships = this._serializeWithNames(obj.relationships)
    }
    const serializedAttributes = this._serializeWithNames(obj)
    delete serializedAttributes.id
    _.extend(result.attributes, serializedAttributes)
    return result
  }

  _parseWithNames (obj) {
    return Object.keys(obj).reduce((result, key) => {
      let value = obj[key]
      let newKey = camelize(key)

      if (_.isArray(value)) {
        value = value.map(item => {
          if (_.isObject(item)) return this._parseWithNames(item)
          else return item
        })
      } else if (_.isObject(value)) {
        value = this._parseWithNames(value)
      }

      result[newKey] = value
      return result
    }, {})
  }

  _serializeWithNames (obj) {
    return Object.keys(obj).reduce((result, key) => {
      if (!_.contains(['relationships', '_type', '_self'], key)) {
        let value = obj[key]
        let newKey = decamelize(key)

        if (_.isArray(value)) {
          value = value.map(item => {
            if (_.isObject(item)) return this._serializeWithNames(item)
            else return item
          })
        } else if (_.isObject(value)) {
          value = this._serializeWithNames(value)
        }

        result[newKey] = value
      }
      return result
    }, {})
  }
}

export default JsonApiParser
