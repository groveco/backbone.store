/**
 * JsonApiParser.
 * @module
 */
import _ from 'underscore'

/**
 * Parser that parses data in JSON API format to BackboneStore format.
 */
class JsonApiParser {

  /**
   * Parses data from JSON API format to BackboneStore format.
   * @param {object} jsonApiData - Data in JSON API format.
   * @returns {object} Data in BackboneStore format.
   */
  parse(jsonApiData) {
    let result = null;
    let data = jsonApiData.data;
    if (data instanceof Array) {
      result = data.map(elem => this._parseSingleObject(elem));
    } else {
      result = this._parseSingleObject(data);
    }
    return result;
  }

  /**
   * Serializes data from BackboneStore format to JSON API format.
   * @param {object} obj - Data in BackboneStore format.
   * @returns {object} Data in JSON API format.
   */
  serialize(obj) {
    let result = {
      data: {
        id: obj.id,
        attributes: {}
      }
    };
    if (obj.relationships) {
      result.data.relationships = this._serializeRelationships(obj.relationships);
    }
    Object.keys(obj).forEach((key, index) => {
      if (key !== 'relationships' && key !== 'id') {
        result.data.attributes[key] = obj[key];
      }
    });
    return result;
  }

  _parseSingleObject(object) {
    let result = {};
    _.extend(result, object.attributes);
    result.id = object.id;
    if (object.relationships) {
      result.relationships = {};
      Object.keys(object.relationships).forEach((key) => {
        let relationship = object.relationships[key];
        result.relationships[key] = this._parseRelationship(relationship);
      });
    }
    return result;
  }

  _parseRelationship(relationship) {
    let result = {};
    if (relationship.data instanceof Array) {
      result.id = relationship.data.map(item => item.id);
    } else {
      result.id = relationship.data.id;
    }
    if (relationship.links && relationship.links.related) {
      result.link = relationship.links.related;
    }
    return result;
  }

  _serializeRelationships(relationships) {
    let result = {};
    Object.keys(relationships).forEach((key, index) => {
      if (relationships[key].id instanceof Array) {
        result[key] ={
          data: relationships[key].id.map(id => {
            return {
              id: id
            }
          })
        };
      } else {
        result[key] = {
          data: {
            id: relationships[key].id
          }
        }
      }
    });
    return result;
  }
}

export {JsonApiParser};