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
    let {data, included=[]} = jsonApiData;

    if (_.isArray(data)) {
      data = data.map(elem => this._parseSingleObject(elem));
    } else {
      data = this._parseSingleObject(data);
    }

    included = included.map(elem => this._parseSingleObject(elem));

    return {data, included};
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
    return Object.keys(obj).reduce((result, key) => {
      let value = obj[key];
      let newKey = this._converter.camelize(key);

      if (_.isArray(value)) {
        value = value.map(item => {
          if (_.isObject(item)) return this._parseWithNames(item);
          else  return item;
        });
      } else if (_.isObject(value)) {
        value = this._parseWithNames(value);
      }

      result[newKey] = value;
      return result
    }, {});
  }

  _serializeWithNames(obj) {
    return Object.keys(obj).reduce((result, key) => {
      if (!_.contains(['relationships', 'id', '_type', '_self'], key)) {
        let value = obj[key];
        let newKey = this._converter.decamelize(key);

        if (_.isArray(value)) {
          value = value.map(item => {
            if (_.isObject(item)) return this._serializeWithNames(item);
            else return item;
          });
        } else if (_.isObject(value)) {
          value = this._serializeWithNames(value);
        }

        result[newKey] = value;
      }
      return result;
    }, {});
  }
}

export default JsonApiParser;
