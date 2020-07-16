/** 
 * Store.
 * @module
 */
import { Collection } from "backbone";
import _ from "underscore";
import clone from "clone";
import JsonApiParser from "./json-api-parser";
import Model from "./internal-model";
import ModelProxy from "./model-proxy";
import CollectionProxy from "./collection-proxy";
import querystring from "querystring";

/**
 * Backbone Store class that manages all {@link https://jsonapi.org/ JSON:API} formatted responses
 * and caching.
 * @param {HttpAdapter} adapter - Adapter to any data source.
 */
class Store {
  constructor(adapter, vuexAdapterInstance, includeFieldsFunc) {
    this._parser = new JsonApiParser();
    this._adapter = adapter;
    this._vuexAdapter = vuexAdapterInstance;
    this._pending = {};
    this._modelDefinitions = {};
    this._includeFieldsFunc = includeFieldsFunc || (() => {});
  }

  /**
   * Toggles whether requests are forced to run sequentially.
   *
   * Defaults to `false`.
   *
   * @example
   *    const store = new Store(new HttpAdapter({urlPrefix: '/api/'}))
   *
   *    const fetch1 = store.get('customer', '20')
   *    store.serializeRequests = true
   *    // Will not start until fetch1 completes
   *    const fetch2 = store.get('offer', '30')
   *    // Will not start until fetch2 (and transitively fetch1) complete
   *    const fetch3 = store.get('whatever', '90')
   *    store.serializeRequests = false
   *    // Will start immediately
   *    const fetch4 = store.get('something', '120')
   */
  get serializeRequests() {
    return this._adapter.serializeRequests;
  }

  set serializeRequests(value) {
    this._adapter.serializeRequests = !!value;
  }

  /**
   * Register a Model to be added into a store
   * @param {String} modelName - model name that is used in relations definitions.
   * @param {Function} definition - Model or collection class.
   * @returns {void}
   */
  register(modelName, definition = {}) {
    this._modelDefinitions[modelName] = definition;
  }

  /***
   *
   * @param {String} modelName - Name of the model to be returned
   * @returns {internal-model}
   */
  modelFor(modelName) {
    let definition = this._modelDefinitions[modelName];

    if (!definition) {
      throw new Error(`"${modelName}" is not registered.`);
    }

    return Model.extend(definition);
  }

  /**
   * Push a raw {@link https://jsonapi.org/ JSON:API} formatted resource into the store.
   * @param {Object} resource - a {@link https://jsonapi.org/ JSON:API} resource
   * @returns {internal-model | Collection}
   */
  push(resource, hasFields) {
    let { data, included } = resource;

    if (!resource.hasOwnProperty("data")) {
      throw new Error(
        "Expected the resource pushed to include a top level property `data`"
      );
    }

    if (included) {
      // includes shouldn't have sparse fieldsets
      included.forEach((model) => this._pushInternalModel(model, !hasFields));
    }

    if (_.isArray(data)) {
      return new Collection(
        data.map((model) => this._pushInternalModel(model, !hasFields))
      );
    }

    if (data == null) {
      return null;
    }

    return this._pushInternalModel(data, !hasFields);
  }

  _pushInternalModel(data, shouldCache = true) {
    let record = this._vuexAdapter.get(data.type, data.id);
    if (record == null) {
      if (shouldCache) {
        this._vuexAdapter.set(data, data.type, data.id);
        record = this._vuexAdapter.get(data.type, data.id);
        record.store = this;
      } else {
        record = this.build(data.type, this._parser.parse(data));
      }
    } else {
      // should work due to reactive BB model
      record.set(this._parser.parse(data));
    }
    return record;
  }

  pushModel(resource) {
    let cachedModel = this._vuexAdapter.get(resource.type, resource.id);
    if (!cachedModel) {
      this._vuexAdapter.set(resource, resource.type, resource.id);
      cachedModel = this._vuexAdapter.get(resource.type, resource.id);
      cachedModel.store = this;
    } else {
      throw new Error(
        `Model of type ${resource.type} and id=${resource.id} already exists`
      );
    }
    // return model
    return cachedModel;
  }

  /**
   * Build an internal model for the store with the objects attributes
   * attached.
   * @param {String} modelName - The name of the model that has been registered within the Store
   * @param {Object} attributes - {@link https://jsonapi.org/ JSON:API} formatted object literal used to build
   * @returns {internal-model}
   */
  build(modelName, attributes) {
    if (attributes == null) {
      attributes = {};
    }

    let Model = this.modelFor(modelName);

    attributes.relationships = attributes.relationships || {};
    attributes._type = attributes._type || modelName;

    if (Model && typeof Model.prototype.relationships === "object") {
      Object.keys(Model.prototype.relationships).forEach((key) => {
        if (!attributes.relationships[key]) {
          attributes.relationships[key] = {
            data: null,
          };
        }
      });
    }

    const model = new Model(attributes);
    model.store = this;

    return model;
  }

  /**
   * Clones (copies) an Object using deep copying.
   *
   * @param { Object } model -  A {@link https://jsonapi.org/ JSON:API} formatted object
   * @returns { internal-model }
   */
  clone(model) {
    const newAttributes = clone(model.attributes);
    delete newAttributes.id;
    delete newAttributes._self;
    if (typeof newAttributes.relationships === "object") {
      Object.keys(newAttributes.relationships).forEach((key) => {
        delete newAttributes.relationships[key].links;
      });
    }
    return this.build(newAttributes._type, newAttributes);
  }

  /**
   * Get model by Id or link. If model is cached on front-end it will be returned from cache, otherwise it will be
   * fetched.
   * @param { String } link - Model link.
   * @returns { Promise<ModelProxy> } Promise for requested model.
   */
  get(type, id, query) {
    let model = this.peek(type, id);
    if (model) {
      return model;
    } else {
      return this.fetch(type, id, query);
    }
  }

  /**
   * Fetch model by Id or link from server.
   * @param {String} link - Model link.
   * @returns {Promise<ModelProxy>} Promise for requested model of type ModelProxy.
   */
  fetch(type, id, options = {}) {
    let { query, link } = options;
    let promise = this._fetch(link || this._adapter.buildUrl(type, id), query);

    let _Model = this.modelFor(type);
    let model = new ModelProxy(new _Model());
    model.promise = promise;

    return model;
  }

  _fetch(link, query) {
    const key = `${link}?${querystring.stringify(query)}`;
    let existingPromise = this._pending[key];

    if (existingPromise == null) {
      let promise = this._adapter.get(link, query).then((response) => {
        return this.push(response, this._includeFieldsFunc(query));
      });

      // We want to attach a final handler, but do not want an error on this
      // promise to go unresolved so we catch it first and then proceed. The
      // returned promise will still raise a global exception if not caught,
      // which is the intended behavior, and should be handled accordingly.
      promise
        .catch(() => {
          // no op
        })
        .finally(() => {
          this._pending[key] = null;
        });

      this._pending[key] = promise;
    }

    return this._pending[key];
  }

  /**
   * Get model by Type and Id from front-end cache.
   * @param {String} type - Model type.
   * @param {String | Number} id - Model id.
   * @returns {ModelProxy | void} A ModelProxy if the requesting model
   * is already cached, else nothing is returned.
   */
  peek(type, id) {
    // NOTE: make this._vuexAdapter.get aware of the query object (fields)
    let resource = this._vuexAdapter.get(type, id);
    if (resource) {
      let model = new ModelProxy(resource);
      return model;
    }
  }

  /***
   *
   * @param {Object} all - All objects
   * @returns {CollectionProxy}
   */
  peekMany(all) {
    let result = new Collection();
    result._incomplete = false;

    return new CollectionProxy(
      all.reduce((memo, item) => {
        let { type, id } = item;
        // NOTE: make this._vuexAdapter.get aware of the query object (fields)
        let peeked = this._vuexAdapter.get(type, id);
        if (peeked) {
          memo.push(peeked);
        } else {
          memo._incomplete = true;
        }
        return memo;
      }, result)
    );
  }

  /**
   * @private
   * @returns {ModelProxy}
   */
  getBelongsTo(owner, link, type, id, query) {
    // NOTE: make peek aware of the query object (fields)
    let model = this.peek(type, id);
    if (model) {
      return model;
    } else {
      return this.fetchBelongsTo(owner, link, type, id, query);
    }
  }

  /**
   * @private
   * @returns {ModelProxy}
   */
  fetchBelongsTo(owner, link, type, id, query) {
    return this.fetch(type, id, { link, query });
  }

  /**
   * @private
   */
  getHasMany(owner, link, all, query) {
    // NOTE: make peekMany aware of the query object (fields)
    let models = this.peekMany(all);
    if (!models.content._incomplete) {
      return models;
    } else {
      return this.fetchHasMany(owner, models, link, query);
    }
  }

  /**
   * @private
   * @returns {CollectionProxy}
   */
  fetchHasMany(owner, models, link, query) {
    if (!models) {
      models = new CollectionProxy();
    }
    let promise = this._fetch(link, query);
    let result = new CollectionProxy(models);
    models.promise = promise;

    return result;
  }

  /**
   * @private
   * @returns {Object}
   */
  fetchUnknown(link, query) {
    return this._fetch(link, query);
  }

  /**
   * Creates an internal-model that will be stored in the Store's
   * cache.
   * @param {internal-model} resource
   * @returns { Promise<ModelProxy> }
   */
  create(resource) {
    let data = this._parser.serialize(resource.attributes);
    return this._adapter
      .create(
        this._adapter.buildUrl(resource.get("_type"), resource.get("id")),
        { data }
      )
      .then((created) => {
        if (created) {
          resource.set(this._parser.parse(created.data));
          // pass in the raw serialized resource to pushModel
          return this.pushModel(created);
        }
      });
  }

  /**
   * Updates a given model
   * @param {Model} resource - Model to be updated
   * @param {Object} options - Object that contains the data that will be used in the update
   * @returns { Promise }
   */
  update(resource, options) {
    let data;
    let partial;

    if (options == null) {
      options = {};
    }

    if (!options.hasOwnProperty("partial")) {
      partial = true;
    } else {
      partial = options.partial;
    }

    if (partial) {
      data = this._parser.serialize({
        id: resource.get("id"),
        _type: resource.get("_type"),
        ...resource.changed,
      });
    } else {
      data = this._parser.serialize(resource.attributes);
    }

    return this._adapter
      .update(resource.get("_self"), { data })
      .then((updated) => resource.set(this._parser.parse(updated.data)));
  }

  /**
   * Remove a record from a server and then from the cache.
   * @param {Model} resource - A Model to be deleted
   * @return {Promise}
   */
  destroy(resource) {
    return this._adapter
      .destroy(resource.get("_self"))
      .then(() => resource.set("isDeleted", true));
  }
}

export default Store;
