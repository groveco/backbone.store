(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.BackboneStore = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

var assign        = _dereq_('es5-ext/object/assign')
  , normalizeOpts = _dereq_('es5-ext/object/normalize-options')
  , isCallable    = _dereq_('es5-ext/object/is-callable')
  , contains      = _dereq_('es5-ext/string/#/contains')

  , d;

d = module.exports = function (dscr, value/*, options*/) {
	var c, e, w, options, desc;
	if ((arguments.length < 2) || (typeof dscr !== 'string')) {
		options = value;
		value = dscr;
		dscr = null;
	} else {
		options = arguments[2];
	}
	if (dscr == null) {
		c = w = true;
		e = false;
	} else {
		c = contains.call(dscr, 'c');
		e = contains.call(dscr, 'e');
		w = contains.call(dscr, 'w');
	}

	desc = { value: value, configurable: c, enumerable: e, writable: w };
	return !options ? desc : assign(normalizeOpts(options), desc);
};

d.gs = function (dscr, get, set/*, options*/) {
	var c, e, options, desc;
	if (typeof dscr !== 'string') {
		options = set;
		set = get;
		get = dscr;
		dscr = null;
	} else {
		options = arguments[3];
	}
	if (get == null) {
		get = undefined;
	} else if (!isCallable(get)) {
		options = get;
		get = set = undefined;
	} else if (set == null) {
		set = undefined;
	} else if (!isCallable(set)) {
		options = set;
		set = undefined;
	}
	if (dscr == null) {
		c = true;
		e = false;
	} else {
		c = contains.call(dscr, 'c');
		e = contains.call(dscr, 'e');
	}

	desc = { get: get, set: set, configurable: c, enumerable: e };
	return !options ? desc : assign(normalizeOpts(options), desc);
};

},{"es5-ext/object/assign":2,"es5-ext/object/is-callable":5,"es5-ext/object/normalize-options":9,"es5-ext/string/#/contains":11}],2:[function(_dereq_,module,exports){
'use strict';

module.exports = _dereq_('./is-implemented')()
	? Object.assign
	: _dereq_('./shim');

},{"./is-implemented":3,"./shim":4}],3:[function(_dereq_,module,exports){
'use strict';

module.exports = function () {
	var assign = Object.assign, obj;
	if (typeof assign !== 'function') return false;
	obj = { foo: 'raz' };
	assign(obj, { bar: 'dwa' }, { trzy: 'trzy' });
	return (obj.foo + obj.bar + obj.trzy) === 'razdwatrzy';
};

},{}],4:[function(_dereq_,module,exports){
'use strict';

var keys  = _dereq_('../keys')
  , value = _dereq_('../valid-value')

  , max = Math.max;

module.exports = function (dest, src/*, …srcn*/) {
	var error, i, l = max(arguments.length, 2), assign;
	dest = Object(value(dest));
	assign = function (key) {
		try { dest[key] = src[key]; } catch (e) {
			if (!error) error = e;
		}
	};
	for (i = 1; i < l; ++i) {
		src = arguments[i];
		keys(src).forEach(assign);
	}
	if (error !== undefined) throw error;
	return dest;
};

},{"../keys":6,"../valid-value":10}],5:[function(_dereq_,module,exports){
// Deprecated

'use strict';

module.exports = function (obj) { return typeof obj === 'function'; };

},{}],6:[function(_dereq_,module,exports){
'use strict';

module.exports = _dereq_('./is-implemented')()
	? Object.keys
	: _dereq_('./shim');

},{"./is-implemented":7,"./shim":8}],7:[function(_dereq_,module,exports){
'use strict';

module.exports = function () {
	try {
		Object.keys('primitive');
		return true;
	} catch (e) { return false; }
};

},{}],8:[function(_dereq_,module,exports){
'use strict';

var keys = Object.keys;

module.exports = function (object) {
	return keys(object == null ? object : Object(object));
};

},{}],9:[function(_dereq_,module,exports){
'use strict';

var forEach = Array.prototype.forEach, create = Object.create;

var process = function (src, obj) {
	var key;
	for (key in src) obj[key] = src[key];
};

module.exports = function (options/*, …options*/) {
	var result = create(null);
	forEach.call(arguments, function (options) {
		if (options == null) return;
		process(Object(options), result);
	});
	return result;
};

},{}],10:[function(_dereq_,module,exports){
'use strict';

module.exports = function (value) {
	if (value == null) throw new TypeError("Cannot use null or undefined");
	return value;
};

},{}],11:[function(_dereq_,module,exports){
'use strict';

module.exports = _dereq_('./is-implemented')()
	? String.prototype.contains
	: _dereq_('./shim');

},{"./is-implemented":12,"./shim":13}],12:[function(_dereq_,module,exports){
'use strict';

var str = 'razdwatrzy';

module.exports = function () {
	if (typeof str.contains !== 'function') return false;
	return ((str.contains('dwa') === true) && (str.contains('foo') === false));
};

},{}],13:[function(_dereq_,module,exports){
'use strict';

var indexOf = String.prototype.indexOf;

module.exports = function (searchString/*, position*/) {
	return indexOf.call(this, searchString, arguments[1]) > -1;
};

},{}],14:[function(_dereq_,module,exports){
'use strict';

module.exports = _dereq_('./is-implemented')() ? Symbol : _dereq_('./polyfill');

},{"./is-implemented":15,"./polyfill":17}],15:[function(_dereq_,module,exports){
'use strict';

module.exports = function () {
	var symbol;
	if (typeof Symbol !== 'function') return false;
	symbol = Symbol('test symbol');
	try { String(symbol); } catch (e) { return false; }
	if (typeof Symbol.iterator === 'symbol') return true;

	// Return 'true' for polyfills
	if (typeof Symbol.isConcatSpreadable !== 'object') return false;
	if (typeof Symbol.iterator !== 'object') return false;
	if (typeof Symbol.toPrimitive !== 'object') return false;
	if (typeof Symbol.toStringTag !== 'object') return false;
	if (typeof Symbol.unscopables !== 'object') return false;

	return true;
};

},{}],16:[function(_dereq_,module,exports){
'use strict';

module.exports = function (x) {
	return (x && ((typeof x === 'symbol') || (x['@@toStringTag'] === 'Symbol'))) || false;
};

},{}],17:[function(_dereq_,module,exports){
// ES2015 Symbol polyfill for environments that do not support it (or partially support it_

'use strict';

var d              = _dereq_('d')
  , validateSymbol = _dereq_('./validate-symbol')

  , create = Object.create, defineProperties = Object.defineProperties
  , defineProperty = Object.defineProperty, objPrototype = Object.prototype
  , NativeSymbol, SymbolPolyfill, HiddenSymbol, globalSymbols = create(null);

if (typeof Symbol === 'function') NativeSymbol = Symbol;

var generateName = (function () {
	var created = create(null);
	return function (desc) {
		var postfix = 0, name, ie11BugWorkaround;
		while (created[desc + (postfix || '')]) ++postfix;
		desc += (postfix || '');
		created[desc] = true;
		name = '@@' + desc;
		defineProperty(objPrototype, name, d.gs(null, function (value) {
			// For IE11 issue see:
			// https://connect.microsoft.com/IE/feedbackdetail/view/1928508/
			//    ie11-broken-getters-on-dom-objects
			// https://github.com/medikoo/es6-symbol/issues/12
			if (ie11BugWorkaround) return;
			ie11BugWorkaround = true;
			defineProperty(this, name, d(value));
			ie11BugWorkaround = false;
		}));
		return name;
	};
}());

// Internal constructor (not one exposed) for creating Symbol instances.
// This one is used to ensure that `someSymbol instanceof Symbol` always return false
HiddenSymbol = function Symbol(description) {
	if (this instanceof HiddenSymbol) throw new TypeError('TypeError: Symbol is not a constructor');
	return SymbolPolyfill(description);
};

// Exposed `Symbol` constructor
// (returns instances of HiddenSymbol)
module.exports = SymbolPolyfill = function Symbol(description) {
	var symbol;
	if (this instanceof Symbol) throw new TypeError('TypeError: Symbol is not a constructor');
	symbol = create(HiddenSymbol.prototype);
	description = (description === undefined ? '' : String(description));
	return defineProperties(symbol, {
		__description__: d('', description),
		__name__: d('', generateName(description))
	});
};
defineProperties(SymbolPolyfill, {
	for: d(function (key) {
		if (globalSymbols[key]) return globalSymbols[key];
		return (globalSymbols[key] = SymbolPolyfill(String(key)));
	}),
	keyFor: d(function (s) {
		var key;
		validateSymbol(s);
		for (key in globalSymbols) if (globalSymbols[key] === s) return key;
	}),

	// If there's native implementation of given symbol, let's fallback to it
	// to ensure proper interoperability with other native functions e.g. Array.from
	hasInstance: d('', (NativeSymbol && NativeSymbol.hasInstance) || SymbolPolyfill('hasInstance')),
	isConcatSpreadable: d('', (NativeSymbol && NativeSymbol.isConcatSpreadable) ||
		SymbolPolyfill('isConcatSpreadable')),
	iterator: d('', (NativeSymbol && NativeSymbol.iterator) || SymbolPolyfill('iterator')),
	match: d('', (NativeSymbol && NativeSymbol.match) || SymbolPolyfill('match')),
	replace: d('', (NativeSymbol && NativeSymbol.replace) || SymbolPolyfill('replace')),
	search: d('', (NativeSymbol && NativeSymbol.search) || SymbolPolyfill('search')),
	species: d('', (NativeSymbol && NativeSymbol.species) || SymbolPolyfill('species')),
	split: d('', (NativeSymbol && NativeSymbol.split) || SymbolPolyfill('split')),
	toPrimitive: d('', (NativeSymbol && NativeSymbol.toPrimitive) || SymbolPolyfill('toPrimitive')),
	toStringTag: d('', (NativeSymbol && NativeSymbol.toStringTag) || SymbolPolyfill('toStringTag')),
	unscopables: d('', (NativeSymbol && NativeSymbol.unscopables) || SymbolPolyfill('unscopables'))
});

// Internal tweaks for real symbol producer
defineProperties(HiddenSymbol.prototype, {
	constructor: d(SymbolPolyfill),
	toString: d('', function () { return this.__name__; })
});

// Proper implementation of methods exposed on Symbol.prototype
// They won't be accessible on produced symbol instances as they derive from HiddenSymbol.prototype
defineProperties(SymbolPolyfill.prototype, {
	toString: d(function () { return 'Symbol (' + validateSymbol(this).__description__ + ')'; }),
	valueOf: d(function () { return validateSymbol(this); })
});
defineProperty(SymbolPolyfill.prototype, SymbolPolyfill.toPrimitive, d('',
	function () { return validateSymbol(this); }));
defineProperty(SymbolPolyfill.prototype, SymbolPolyfill.toStringTag, d('c', 'Symbol'));

// Proper implementaton of toPrimitive and toStringTag for returned symbol instances
defineProperty(HiddenSymbol.prototype, SymbolPolyfill.toStringTag,
	d('c', SymbolPolyfill.prototype[SymbolPolyfill.toStringTag]));

// Note: It's important to define `toPrimitive` as last one, as some implementations
// implement `toPrimitive` natively without implementing `toStringTag` (or other specified symbols)
// And that may invoke error in definition flow:
// See: https://github.com/medikoo/es6-symbol/issues/13#issuecomment-164146149
defineProperty(HiddenSymbol.prototype, SymbolPolyfill.toPrimitive,
	d('c', SymbolPolyfill.prototype[SymbolPolyfill.toPrimitive]));

},{"./validate-symbol":18,"d":1}],18:[function(_dereq_,module,exports){
'use strict';

var isSymbol = _dereq_('./is-symbol');

module.exports = function (value) {
	if (!isSymbol(value)) throw new TypeError(value + " is not a symbol");
	return value;
};

},{"./is-symbol":16}],19:[function(_dereq_,module,exports){
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

var _httpMethods = _dereq_('./http-methods');

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
},{"./http-methods":20}],20:[function(_dereq_,module,exports){
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

},{}],21:[function(_dereq_,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Store = exports.Repository = exports.JsonApiParser = exports.HttpAdapter = undefined;

var _httpAdapter = _dereq_('./http-adapter');

var _jsonApiParser = _dereq_('./json-api-parser');

var _repository = _dereq_('./repository');

var _store = _dereq_('./store');

exports.HttpAdapter = _httpAdapter.HttpAdapter;
exports.JsonApiParser = _jsonApiParser.JsonApiParser;
exports.Repository = _repository.Repository;
exports.Store = _store.Store;

},{"./http-adapter":19,"./json-api-parser":22,"./repository":23,"./store":24}],22:[function(_dereq_,module,exports){
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
},{}],23:[function(_dereq_,module,exports){
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
},{}],24:[function(_dereq_,module,exports){
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

var _es6Symbol = _dereq_('es6-symbol');

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
},{"es6-symbol":14}]},{},[21])(21)
});