(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.BackboneStore = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HttpAdapter = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * HttpAdapter
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @module
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _jquery = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);

var _jquery2 = _interopRequireDefault(_jquery);

var _httpMethods = require('./http-methods');

var _rsvp = (typeof window !== "undefined" ? window['RSVP'] : typeof global !== "undefined" ? global['RSVP'] : null);

var _rsvp2 = _interopRequireDefault(_rsvp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Adapter which works with data over HTTP.
 */

var HttpAdapter = function () {

  /**
   * Create a HttpAdapter
   * @param {string} url - Base resource url.
   * @param parser - Parser which parses data from specified format to BackboneStore format
   */

  function HttpAdapter(url, parser) {
    _classCallCheck(this, HttpAdapter);

    this._parser = parser;
    this._url = url;
  }

  /**
   * Get entity by Id.
   * @param {number|string} id - Entity Id.
   * @returns {Promise} Promise for fetched data.
   */


  _createClass(HttpAdapter, [{
    key: 'getById',
    value: function getById(id) {
      var _this = this;

      return new _rsvp2.default.Promise(function (resolve, reject) {
        _this._ajax(id, _httpMethods.HttpMethods.GET).then(function (data) {
          resolve(_this._parser.parse(data));
        }, function () {
          reject();
        });
      });
    }

    /**
     * Get entity by link.
     * @param {string} link - Link to entity.
     * @returns {Promise} Promise for fetched data.
     */

  }, {
    key: 'getByLink',
    value: function getByLink(link) {
      var _this2 = this;

      return new _rsvp2.default.Promise(function (resolve, reject) {
        _this2._ajaxByLink(link).then(function (data) {
          resolve(_this2._parser.parse(data));
        }, function () {
          reject();
        });
      });
    }

    /**
     * Create entity.
     * @param {object} attributes - Data to create entity with.
     * @returns {Promise} Promise for created data.
     */

  }, {
    key: 'create',
    value: function create(attributes) {
      var _this3 = this;

      return new _rsvp2.default.Promise(function (resolve, reject) {
        _this3._ajax(null, _httpMethods.HttpMethods.POST, _this3._parser.serialize(attributes)).then(function (data) {
          resolve(_this3._parser.parse(data));
        }, function () {
          reject();
        });
      });
    }

    /**
     * Update entity.
     * @param {number|string} id - Entity Id.
     * @param {object} attributes - Data to update entity with.
     * @returns {Promise} Promise for updated data.
     */

  }, {
    key: 'update',
    value: function update(id, attributes) {
      var _this4 = this;

      return new _rsvp2.default.Promise(function (resolve, reject) {
        _this4._ajax(id, _httpMethods.HttpMethods.PUT, _this4._parser.serialize(attributes)).then(function (data) {
          resolve(_this4._parser.parse(data));
        }, function () {
          reject();
        });
      });
    }

    /**
     * Destroy entity.
     * @param {number|string} id - Entity Id.
     * @returns {Promise} Promise for destroy.
     */

  }, {
    key: 'destroy',
    value: function destroy(id) {
      var _this5 = this;

      return new _rsvp2.default.Promise(function (resolve, reject) {
        _this5._ajax(id, _httpMethods.HttpMethods.DELETE).then(function () {
          resolve();
        }, function () {
          reject();
        });
      });
    }
  }, {
    key: '_ajax',
    value: function _ajax(id, type, data) {
      var _this6 = this;

      return new _rsvp2.default.Promise(function (resolve, reject) {
        var options = {
          url: _this6._url,
          type: type,
          contentType: 'application/vnd.api+json',
          success: function success(data) {
            resolve(data);
          },
          error: function error() {
            reject();
          }
        };
        if (id) {
          options.url += id + '/';
        }
        if (data) {
          if ([_httpMethods.HttpMethods.POST, _httpMethods.HttpMethods.PUT].indexOf(type) > -1) {
            options.data = JSON.stringify(data);
          } else {
            options.data = data;
          }
        }
        _jquery2.default.ajax(options);
      });
    }
  }, {
    key: '_ajaxByLink',
    value: function _ajaxByLink(link) {
      return new _rsvp2.default.Promise(function (resolve, reject) {
        var options = {
          url: link,
          type: _httpMethods.HttpMethods.GET,
          contentType: 'application/vnd.api+json',
          success: function success(data) {
            resolve(data);
          },
          error: function error() {
            reject();
          }
        };
        _jquery2.default.ajax(options);
      });
    }
  }]);

  return HttpAdapter;
}();

exports.HttpAdapter = HttpAdapter;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./http-methods":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var HttpMethods = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE'
};

exports.HttpMethods = HttpMethods;

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Store = exports.Repository = exports.JsonApiParser = exports.HttpAdapter = undefined;

var _httpAdapter = require('./http-adapter');

var _jsonApiParser = require('./json-api-parser');

var _repository = require('./repository');

var _store = require('./store');

exports.HttpAdapter = _httpAdapter.HttpAdapter;
exports.JsonApiParser = _jsonApiParser.JsonApiParser;
exports.Repository = _repository.Repository;
exports.Store = _store.Store;

},{"./http-adapter":1,"./json-api-parser":4,"./repository":5,"./store":6}],4:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsonApiParser = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * JsonApiParser.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @module
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _underscore = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Parser that parses data in JSON API format to BackboneStore format.
 */

var JsonApiParser = function () {
  function JsonApiParser() {
    _classCallCheck(this, JsonApiParser);
  }

  _createClass(JsonApiParser, [{
    key: 'parse',


    /**
     * Parses data from JSON API format to BackboneStore format.
     * @param {object} jsonApiData - Data in JSON API format.
     * @returns {object} Data in BackboneStore format.
     */
    value: function parse(jsonApiData) {
      var _this = this;

      var result = null;
      var data = jsonApiData.data;
      if (data instanceof Array) {
        result = data.map(function (elem) {
          return _this._parseSingleObject(elem);
        });
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

  }, {
    key: 'serialize',
    value: function serialize(obj) {
      var result = {
        data: {
          id: obj.id,
          attributes: {}
        }
      };
      if (obj.relationships) {
        result.data.relationships = this._serializeRelationships(obj.relationships);
      }
      Object.keys(obj).forEach(function (key, index) {
        if (key !== 'relationships' && key !== 'id') {
          result.data.attributes[key] = obj[key];
        }
      });
      return result;
    }
  }, {
    key: '_parseSingleObject',
    value: function _parseSingleObject(object) {
      var _this2 = this;

      var result = {};
      _underscore2.default.extend(result, object.attributes);
      result.id = object.id;
      if (object.relationships) {
        result.relationships = {};
        Object.keys(object.relationships).forEach(function (key) {
          var relationship = object.relationships[key];
          result.relationships[key] = _this2._parseRelationship(relationship);
        });
      }
      return result;
    }
  }, {
    key: '_parseRelationship',
    value: function _parseRelationship(relationship) {
      var result = {};
      if (relationship.data instanceof Array) {
        result.id = relationship.data.map(function (item) {
          return item.id;
        });
      } else {
        result.id = relationship.data.id;
      }
      if (relationship.links && relationship.links.related) {
        result.link = relationship.links.related;
      }
      return result;
    }
  }, {
    key: '_serializeRelationships',
    value: function _serializeRelationships(relationships) {
      var result = {};
      Object.keys(relationships).forEach(function (key, index) {
        if (relationships[key].id instanceof Array) {
          result[key] = {
            data: relationships[key].id.map(function (id) {
              return {
                id: id
              };
            })
          };
        } else {
          result[key] = {
            data: {
              id: relationships[key].id
            }
          };
        }
      });
      return result;
    }
  }]);

  return JsonApiParser;
}();

exports.JsonApiParser = JsonApiParser;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Repository = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Repository.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @module
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _underscore = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);

var _underscore2 = _interopRequireDefault(_underscore);

var _backbone = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);

var _backbone2 = _interopRequireDefault(_backbone);

var _rsvp = (typeof window !== "undefined" ? window['RSVP'] : typeof global !== "undefined" ? global['RSVP'] : null);

var _rsvp2 = _interopRequireDefault(_rsvp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Repository class which provides access to entities and stores them.
 */

var Repository = function () {

  /**
   * Creates Repository.
   * @param {Function} entityClass - Model or collection class of repository model.
   * @param adapter - Adapter to any data source.
   */

  function Repository(entityClass, adapter) {
    _classCallCheck(this, Repository);

    var collection = new entityClass();
    if (collection instanceof _backbone2.default.Model) {
      this.modelClass = entityClass;
      this.collectionClass = _backbone2.default.Collection.extend({
        model: this.modelClass
      });
    } else {
      this.collectionClass = entityClass;
      this.modelClass = entityClass.prototype.model;
    }
    this.collection = new this.collectionClass();
    this._adapter = adapter;
  }

  /**
   * Get model by Id or link. If model is cached on front-end it will be returned from cache, otherwise it will be
   * fetched.
   * @param {number} id - Model Id.
   * @param {string} [link] - Model link.
   * @returns {Promise} Promise for requested model.
   */


  _createClass(Repository, [{
    key: 'get',
    value: function get(id, link) {
      var _this = this;

      return new _rsvp2.default.Promise(function (resolve, reject) {
        var model = _this.pluck(id);
        if (model) {
          resolve(model);
        } else {
          _this.fetch(id, link).then(function (model) {
            resolve(model);
          }, function () {
            reject();
          });
        }
      });
    }

    /**
     * Fetch model by Id or link from server.
     * @param {number} id - Model Id.
     * @param {string} [link] - Model link.
     * @returns {Promise} Promise for requested model.
     */

  }, {
    key: 'fetch',
    value: function fetch(id, link) {
      var _this2 = this;

      return new _rsvp2.default.Promise(function (resolve, reject) {
        var model = new _this2.modelClass();
        var adapterPromise = void 0;
        if (link) {
          adapterPromise = _this2._adapter.getByLink(link);
        } else {
          adapterPromise = _this2._adapter.getById(id);
        }
        adapterPromise.then(function (data) {
          model.set(data);
          _this2.collection.set(model);
          resolve(model);
        }, function () {
          reject();
        });
      });
    }

    /**
     * Get model by Id from front-end cache.
     * @param {number} id - Model Id.
     * @returns {Promise} Promise for requested model.
     */

  }, {
    key: 'pluck',
    value: function pluck(id) {
      return this.collection.get(id);
    }

    /**
     * Get collection by link.
     * @param {string} link - Collection link.
     * @returns {Promise} Promise for requested collection.
     */

  }, {
    key: 'getCollectionByLink',
    value: function getCollectionByLink(link) {
      var _this3 = this;

      return new _rsvp2.default.Promise(function (resolve, reject) {
        var collection = new _this3.collectionClass();
        _this3._adapter.getByLink(link).then(function (data) {
          collection.set(data);
          _this3.collection.set(collection.models);
          resolve(collection);
        }, function () {
          reject();
        });
      });
    }

    /**
     * Create model.
     * @param {object} attributes - Data to create model with.
     * @returns {Promise} Promise for created model.
     */

  }, {
    key: 'create',
    value: function create() {
      var _this4 = this;

      var attributes = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return new _rsvp2.default.Promise(function (resolve, reject) {
        var model = new _this4.modelClass();
        _this4._adapter.create(attributes).then(function (data) {
          model.set(data);
          _this4.collection.set(model);
          resolve(model);
        }, function () {
          reject();
        });
      });
    }

    /**
     * Create model.
     * @param {Backbone.Model} model - Model to update.
     * @param {object} attributes - Data to update model with.
     * @returns {Promise} Promise for updated model.
     */

  }, {
    key: 'update',
    value: function update(model, attributes) {
      var _this5 = this;

      return new _rsvp2.default.Promise(function (resolve, reject) {
        model.set(attributes);
        _this5._adapter.update(model.id, model.toJSON()).then(function (data) {
          model.clear().set(data);
          resolve(model);
        }, function () {
          reject();
        });
      });
    }

    /**
     * Destroy model.
     * @param {number} id - Id of model to destroy.
     * @returns {Promise} Promise for destroy.
     */

  }, {
    key: 'destroy',
    value: function destroy(id) {
      var _this6 = this;

      return new _rsvp2.default.Promise(function (resolve, reject) {
        var model = _this6.collection.get(id);
        if (model) {
          _this6._adapter.destroy(id).then(function () {
            _this6.collection.remove(model);
            resolve();
          }, function () {
            reject();
          });
        } else {
          reject('Model does not exist');
        }
      });
    }
  }]);

  return Repository;
}();

exports.Repository = Repository;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Store = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Store.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @module
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _backbone = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);

var _backbone2 = _interopRequireDefault(_backbone);

var _es6Symbol = require('es6-symbol');

var _es6Symbol2 = _interopRequireDefault(_es6Symbol);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var actions = {
  GET: 0,
  PLUCK: 1,
  FETCH: 2
};

/**
 * Add getRelated, fetchRelated and pluckRelated methods to Backbone.Model.
 * @param {Store} store - Backbone Store instance that will be used in getAsync method.
 */
var addRelatedMethods = function addRelatedMethods(store) {
  var resolveRelatedMethod = function resolveRelatedMethod(relationName, action) {
    var isCollection = false;
    var modelName = this.relatedModels && this.relatedModels[relationName];
    if (!modelName) {
      modelName = this.relatedCollections && this.relatedCollections[relationName];
      isCollection = true;
    }
    if (!modelName) {
      throw new Error('Relation for "' + relationName + '" is not defined in the model.');
    }

    var relationship = this.get('relationships') && this.get('relationships')[relationName];
    if (!relationship) {
      throw new Error('There is no related model "' + modelName + '".');
    }

    var repository = store.getRepository(modelName);
    if (!repository) {
      throw new Error('Can`t get repository for "' + modelName + '".');
    }

    if (isCollection) {
      if (relationship.link) {
        if (action == actions.FETCH) {
          return repository.getCollectionByLink(relationship.link);
        } else {
          throw new Error('Collection should be fetched. Use "fetchRelated".');
        }
      } else {
        throw new Error('Can\'t fetch collection of "' + modelName + '" without link.');
      }
    } else {
      if (action === actions.GET) {
        return repository.get(relationship.id, relationship.link);
      } else if (action === actions.FETCH) {
        return repository.fetch(relationship.id, relationship.link);
      } else if (action === actions.PLUCK) {
        return repository.pluck(relationship.id);
      } else {
        throw new Error('Unknown action');
      }
    }
  };

  /**
   * Get related model. If model is cached on front-end it will be returned from cache, otherwise it will be fetched.
   * @param {string} relationName - Name of relation to requested model.
   * @returns {Promise} Promise for requested model.
   */
  _backbone2.default.Model.prototype.getRelated = function (relationName) {
    return resolveRelatedMethod.call(this, relationName, actions.GET);
  };

  /**
   * Fetch related model or collection from server.
   * @param {string} relationName - Name of relation to requested model or collection.
   * @returns {Promise} Promise for requested model or collection.
   */
  _backbone2.default.Model.prototype.fetchRelated = function (relationName) {
    return resolveRelatedMethod.call(this, relationName, actions.FETCH);
  };

  /**
   * Get related model from front-end cache.
   * @param {string} relationName - Name of relation to requested model.
   * @returns {Promise} Promise for requested model.
   */
  _backbone2.default.Model.prototype.pluckRelated = function (relationName) {
    return resolveRelatedMethod.call(this, relationName, actions.PLUCK);
  };
};

var store = null;
var privateEnforcer = (0, _es6Symbol2.default)();

/**
 * Backbone Store class that manages all repositories.
 */

var Store = function () {

  /**
   * Create Store.
   * @param {Symbol} enforcer - Symbol to make constructor private.
   */

  function Store(enforcer) {
    _classCallCheck(this, Store);

    if (enforcer !== privateEnforcer) {
      throw new Error("Constructor is private, use Store.instance() instead");
    }
    this._repositories = {};
  }

  /**
   * Get Store instance as singleton.
   * @returns {Store} Store instance.
   */


  _createClass(Store, [{
    key: 'register',


    /**
     * Register repository in Store.
     * @param {string} modelName - model name that is used in relations definitions.
     * @param {Repository} repository - Registered repository.
     */
    value: function register(modelName, repository) {
      this._repositories[modelName] = repository;
    }

    /**
     * Get registered repository.
     * @param {string} modelName - model name that is used in relations definitions and that was passed to register method.
     * @returns {Repository} Repository with specified modelName.
     */

  }, {
    key: 'getRepository',
    value: function getRepository(modelName) {
      return this._repositories[modelName];
    }
  }], [{
    key: 'instance',
    value: function instance() {
      if (store === null) {
        store = new Store(privateEnforcer);
        addRelatedMethods(store);
      }
      return store;
    }
  }]);

  return Store;
}();

exports.Store = Store;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"es6-symbol":"es6-symbol"}]},{},[3])(3)
});