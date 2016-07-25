/**
 * Store.
 * @module
 */
import _ from 'underscore';
import JsonApiParser from './json-api-parser';
import Repository from './repository';
import Model from './repository-model';
import RSVP from 'rsvp';

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
      return data.map(model => this._pushInternalModel(model));
    }

    if (data == null) {
      return null;
    }

    return this._pushInternalModel(data);
  }

  _pushInternalModel(data) {
    let model = this.modelFor(data.type);
    let record = new model(this._parser.parse(data));
    return this._repository.set(record);
  }

  /**
   * Get model by Id or link. If model is cached on front-end it will be returned from cache, otherwise it will be
   * fetched.
   * @param {string} link - Model link.
   * @returns {Promise} Promise for requested model.
   */
  get(link, query) {
    let model = this.peek(link);
    if (model) {
      return new RSVP.Promise(resolve => resolve(model));
    } else {
      return this.fetch(link, query);
    }
  }

  /**
   * Fetch model by Id or link from server.
   * @param {string} link - Model link.
   * @returns {Promise} Promise for requested model.
   */
  fetch(link, query) {
    let existingPromise = this._pending[link];

    if (existingPromise) {
      return existingPromise;
    } else {
      let promise = this._adapter.get(link, query)
        .then(response => {
          return this.push(response);
        });

      promise.finally(() => {
        return this._pending[link] = null;
      });

      this._pending[link] = promise;

      return promise;
    }
  }

  /**
   * Get model by link from front-end cache.
   * @param {string} link - Model self link.
   * @returns {object} Requested model.
   */
  peek(link) {
    return this._repository.get(link);
  }

  /**
   * Get model by Type and Id from front-end cache.
   * @param {string} type - Model type.
   * @param {string|number} id - Model id.
   * @returns {object} Requested model.
   */
  pluckByTypeId(type, id) {
    return this._repository.get(`${type}__${id}`);
  }
}

export default Store;
