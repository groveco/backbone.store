/**
 * Store.
 * @module
 */
import {Collection} from 'backbone';
import _ from 'underscore';
import clone from 'clone';
import JsonApiParser from './json-api-parser';
import Repository from './repository';
import Model from './internal-model';
import ModelProxy from './model-proxy';
import CollectionProxy from './collection-proxy';
import querystring from 'querystring';

/**
 * Backbone Store class that manages all repositories.
 */
class Store {

  /**
   * Create Store.
   * @param {HttpAdapter} adapter - Adapter to any data source.
   */
  constructor(adapter) {
    this._parser = new JsonApiParser();
    this._adapter = adapter;
    this._repository = new Repository();
    this._pending = {};
    this._modelDefinitions = {};
  }

  /**
   * Register repository in Store.
   * @param {string} modelName - model name that is used in relations definitions.
   * @param {Function} definition - Model or collection class.
   */
  register(modelName, definition={}) {
    this._modelDefinitions[modelName] = definition;
  }

  modelFor(modelName) {
    let definition = this._modelDefinitions[modelName];

    if (!definition) {
      throw new Error(`"${modelName}" is not registered.`);
    }

    return Model.extend(definition);
  }

  /**
   * Push a raw JSON API document into the store.
   * @param {string} modelName - model name that is used in relations definitions.
   * @param {Function} resource - a JSON API document
   */
  push(resource) {
    let {data, included} = resource;

    if (!resource.hasOwnProperty('data')) {
      throw new Error('Expected the resource pushed to include a top level property `data`');
    }

    if (included) {
      included.forEach(model => this._pushInternalModel(model));
    }

    if (_.isArray(data)) {
      return new Collection(data.map(model => this._pushInternalModel(model)));
    }

    if (data == null) {
      return null;
    }

    return this._pushInternalModel(data);
  }

  _pushInternalModel(data) {
    let record = this._repository.get(`${data.type}__${data.id}`);
    if (record == null) {
      record = this.build(data.type, this._parser.parse(data));
      this._repository.set(record);
    } else {
      record.set(this._parser.parse(data));
    }
    return record;
  }

  pushModel(model) {
    let cachedModel = this._repository.get(`${model.get('_type')}__${model.id}`);
    if (!cachedModel) {
      this._repository.set(model);
    } else {
      throw new Error(`Model of type ${model.get('_type')} and id=${model.id} already exists`);
    }
    return model;
  }

  build(type, attributes) {
    if (attributes == null) {
      attributes = {};
    }

    let Model = this.modelFor(type);

    attributes.relationships = attributes.relationships || {};
    attributes._type = attributes._type || type;

    if (Model && typeof Model.prototype.relationships === 'object') {
      Object.keys(Model.prototype.relationships).forEach((key) => {
        if (!attributes.relationships[key]) {
          attributes.relationships[key] = {
            data: null
          }
        }
      });
    }

    const model = new Model(attributes);
    model.store = this;

    return model;
  }

  clone(model) {
    const newAttributes = clone(model.attributes);
    delete newAttributes.id;
    delete newAttributes._self;
    if (typeof newAttributes.relationships === 'object') {
      Object.keys(newAttributes.relationships).forEach((key) => {
        delete newAttributes.relationships[key].links;
      });
    }
    return this.build(newAttributes._type, newAttributes);
  }

  /**
   * Get model by Id or link. If model is cached on front-end it will be returned from cache, otherwise it will be
   * fetched.
   * @param {string} link - Model link.
   * @returns {Promise} Promise for requested model.
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
   * @param {string} link - Model link.
   * @returns {Promise} Promise for requested model.
   */
  fetch(type, id, options={}) {
    let {query, link} = options;
    let key = `${type}__${id}`;
    let promise = this._fetch(key, link || this._adapter.buildUrl(type, id), query);

    let _Model = this.modelFor(type);
    let model = new ModelProxy(new _Model());
    model.promise = promise;

    return model;
  }

  _fetch(key, link, query) {
    let existingPromise = this._pending[key];

    if (existingPromise == null) {
      let promise = this._adapter.get(link, query)
        .then(response => {
          return this.push(response);
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
   * @param {string} type - Model type.
   * @param {string|number} id - Model id.
   * @returns {object} Requested model.
   */
  peek(type, id) {
    let resource = this._repository.get(`${type}__${id}`);
    if (resource) {
      let model = new ModelProxy(resource);
      return model;
    }
  }

  peekMany(all) {
    let result = new Collection();
    result._incomplete = false;

    return new CollectionProxy(all.reduce((memo, item) => {
      let {type, id} = item;
      let peeked = this._repository.get(`${type}__${id}`);
      if (peeked) {
        memo.push(peeked);
      } else {
        memo._incomplete = true;
      }
      return memo;
    }, result));
  }

  /**
   * @private
   */
  getBelongsTo(owner, link, type, id, query) {
    let model = this.peek(type, id);
    if (model) {
      return model;
    } else {
      return this.fetchBelongsTo(owner, link, type, id, query);
    }
  }

  /**
   * @private
   */
  fetchBelongsTo(owner, link, type, id, query) {
    return this.fetch(type, id, {link, query});
  }

  /**
   * @private
   */
  getHasMany(owner, link, all, query) {
    let models = this.peekMany(all);
    if (!models.content._incomplete) {
      return models;
    } else {
      return this.fetchHasMany(owner, models, link, query);
    }
  }

  /**
   * @private
   */
  fetchHasMany(owner, models, link, query) {
    if (!models) {
      models = new CollectionProxy();
    }
    const queryString = querystring.stringify(query);
    let promise = this._fetch(`${link}?${queryString}`, link, query);
    let result = new CollectionProxy(models);
    models.promise = promise;

    return result;
  }

  create(resource) {
    let data = this._parser.serialize(resource.attributes);
    return this._adapter.create(this._adapter.buildUrl(resource.get('_type'), resource.get('id')), {data})
      .then(created => {
        if (created) {
          resource.set(this._parser.parse(created.data));
          return this.pushModel(resource);
        }
      });
  }

  update(resource, options) {
    let data;
    let partial;

    if (options == null) {
      options = {};
    }

    if (!options.hasOwnProperty('partial')) {
      partial = true;
    } else {
      partial = options.partial;
    }

    if (partial) {
      data = this._parser.serialize({
        id: resource.get('id'),
        _type: resource.get('_type'),
        ...resource.changed,
      });
    } else {
      data = this._parser.serialize(resource.attributes);
    }

    return this._adapter.update(resource.get('_self'), {data})
      .then(updated => resource.set(this._parser.parse(updated.data)));
  }

  destroy(resource) {
    return this._adapter
      .destroy(resource.get('_self'))
      .then(() => resource.set('isDeleted', true));
  }
}

export default Store;
