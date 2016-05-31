/**
 * JsonApiParser.
 * @module
 */

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
    Object.keys(obj.data).forEach((key, index) => {
      if (key !== 'relationships' && key !== 'id' && key !== '_type' && key !== '_self') {
        result.data.attributes[this._converter.decamelize(key)] = obj.data[key];
      }
    });
    return result;
  }

  _parseSingleObject(object) {
    let result = {};
    if (object.attributes) {
      Object.keys(object.attributes).forEach((key, index) => {
        result[this._converter.camelize(key)] = object.attributes[key];
      });
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
}

export default JsonApiParser;