/**
 * JsonApiParser.
 * @module
 */
import _ from 'underscore'

/**
 * Parser that parses data in JSON API format to BackboneStore format.
 */
class JsonApiParser {

  constructor(converter) {
    this._converter = converter;
  }

  /**
   * Parses data from JSON API format to BackboneStore format.
   * @param {object} jsonApiData - Data in JSON API format.
   * @returns {object} Data in BackboneStore format.
   */
  parse(jsonApiData) {
    let result = {
      data: {},
      included: []
    };
    let data = jsonApiData.data;
    if (data instanceof Array) {
      result.data = data.map(elem => this._parseSingleObject(elem));
    } else {
      result.data = this._parseSingleObject(data);
    }
    let included = jsonApiData.included;
    if (included instanceof Array) {
      result.included = included.map(elem => this._parseSingleObject(elem));
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
        id: obj.data.id,
        type: obj.data._type,
        attributes: {}
      }
    };
    if (obj.data._self) {
      result.data.links = {
        self: obj.data._self
      };
    }
    if (obj.data.relationships) {
      result.data.relationships = obj.data.relationships;
    }
    _.extend(result.data.attributes, this._serializeWithNames(obj.data));
    return result;
  }

  _parseSingleObject(object) {
    let result = {};
    if (object.attributes) {
      _.extend(result, this._parseWithNames(object.attributes));
    }
    result.id = object.id;
    result._type = object.type;
    if (object.links && object.links.self) {
      result._self = object.links.self;
    }
    if (object.relationships) {
      result.relationships = object.relationships;
    }
    return result;
  }

  _parseWithNames(obj) {
    let result = {};
    Object.keys(obj).forEach((key, index) => {
      let value = obj[key];
      let newKey = this._converter.camelize(key);
      if (JsonApiParser._isArray(value)) {
        value = value.map(item => {
          let mapped = item;
          if (JsonApiParser._isObject(item)) {
            mapped = this._parseWithNames(item);
          }
          return mapped;
        });
      }
      if (JsonApiParser._isObject(value)) {
        value = this._parseWithNames(value);
      }
      result[newKey] = value;
    });
    return result;
  }

  _serializeWithNames(obj) {
    let result = {};
    Object.keys(obj).forEach((key, index) => {
      if (key !== 'relationships' && key !== 'id' && key !== '_type' && key !== '_self') {
        let value = obj[key];
        let newKey = this._converter.decamelize(key);
        if (JsonApiParser._isArray(value)) {
          value = value.map(item => {
            let mapped = item;
            if (JsonApiParser._isObject(item)) {
              mapped = this._serializeWithNames(item);
            }
            return mapped;
          });
        }
        if (JsonApiParser._isObject(value)) {
          value = this._serializeWithNames(value);
        }
        result[newKey] = value;
      }
    });
    return result;
  }

  static _isObject(value) {
    return value !== null && !JsonApiParser._isArray(value) && typeof value === 'object';
  }

  static _isArray(value) {
    if (Array.isArray) {
      return Array.isArray(value);
    } else {
      return Object.prototype.toString.call(value) === '[object Array]';
    }
  }
}

export default JsonApiParser;