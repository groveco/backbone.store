class JsonApiParser {
  parse(jsonApiData) {
    let result = {};
    Object.assign(result, jsonApiData.data.attributes);
    result.id = jsonApiData.data.id;
    if (jsonApiData.data.relationships) {
      result.relationships = {};
      Object.keys(jsonApiData.data.relationships).forEach((key) => {
        let relationship = jsonApiData.data.relationships[key];
        result.relationships[key] = this._parseRelationship(relationship);
      });
    }
    return result;
  }

  serialize(obj) {
    let result = {
      data: {
        id: obj.id,
        attributes: {}
      }
    };
    if (obj.relationships) {
      result.relationships = this._serializeRelationships(obj.relationships);
    }
    Object.keys(obj).forEach((key, index) => {
      if (key !== 'relationships' && key !== 'id') {
        result.data.attributes[key] = obj[key];
      }
    });
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
    result = {};
    Object.keys(relationships).forEach((key, index) => {
      if (relationships[key] instanceof Array) {
        result[key] = relationships[key].map(item => {
          return {
            data: {
              id: item
            }
          };
        });
      } else {
        result[key] = {
          data: {
            id: relationships[key]
          }
        }
      }
    });
    return result;
  }
}

export {JsonApiParser};