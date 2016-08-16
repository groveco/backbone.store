import _ from 'underscore';
import {Model} from 'backbone';
import CollectionProxy from './collection-proxy';
import ModelProxy from './model-proxy';

let InternalModel = Model.extend({
  constructor: function (attributes) {
    let defaults = _.result(this, 'defaults');
    attributes || (attributes = {});

    this.cid = _.uniqueId(this.cidPrefix);
    this.attributes = {};
    if (this.computed == null) this.computed = {};
    attributes = _.defaults(_.extend({}, defaults, attributes), defaults);
    this.set(attributes);
    this.changed = {};
    this.initialize.apply(this, arguments);
  },

  toJSON() {
    let attributes = _.clone(this.attributes);
    let computed = _.mapObject(this.computed, (cp) => cp.call(this));
    return _.extend(attributes, computed);
  },

  get(attr) {
    if (this.attributes.hasOwnProperty(attr)) {
      return this.attributes[attr];
    } else if (this.computed.hasOwnProperty(attr)) {
      return this.computed[attr].call(this);
    }
  },

  getRelationshipType(relationName) {
    let relationship = this.getRelationship(relationName);
    if (_.isArray(relationship.data)) {
      return 'has-many';
    } else {
      return 'belongs-to';
    }
  },

  getRelationshipLink(relationName) {
    let link = this.getRelationship(relationName).links.related;
    if (link == null) {
      throw new Error('link is undefined, can\'t do that');
    }
    return link;
  },

  getRelationship(relationName) {
    let modelName = this._getRelationForName(relationName);
    if (modelName == null) {
      throw new Error('Relation for "' + relationName + '" is not defined in the model.');
    }

    let relationship = this.get('relationships') && this.get('relationships')[relationName];
    if (relationship == null) {
      throw new Error('There is no related model "' + modelName + '".');
    }

    return relationship;
  },

  /**
   * Get related model. If model is cached on front-end it will be returned from cache, otherwise it will be fetched.
   * @param {string} relationName - Name of relation to requested model.
   * @returns {Promise} Promise for requested model.
   */
  getRelated(relationName) {
    let peeked = this.peekRelated(relationName);
    if (!peeked) {
      let model = new ModelProxy();
      model.promise = this.fetchRelated(relationName);
      return model;
    } else if (peeked.hasOwnProperty('length') && peeked._incomplete) {
      let collection = new CollectionProxy(peeked);
      collection.promise = this.fetchRelated(relationName);
      return collection;
    } else if (peeked.hasOwnProperty('length')) {
      return new CollectionProxy(peeked);
    } else {
      return new ModelProxy(peeked);
    }
  },

  /**
   * Fetch related model or collection from server.
   * @param {string} relationName - Name of relation to requested model or collection.
   * @returns {Promise} Promise for requested model or collection.
   */
  fetchRelated(relationName) {
    let link = this.getRelationshipLink(relationName);
    let {type, id} = this.getRelationship(relationName).data;
    return this.store.fetch(type, id);
  },

  /**
   * Get related model from front-end cache.
   * @param {string} relationName - Name of relation to requested model.
   * @returns {Promise} Promise for requested model.
   */
  peekRelated(relationName) {
    let relationship = this.getRelationship(relationName);
    if (this.getRelationshipType(relationName) === 'has-many') {
      return this.store.peekMany(relationship.data);
    } else if (relationship.data) {
      return this.store.peek(relationship.data.type, relationship.data.id);
    }
  },

  _getRelationForName(relationName) {
    return this.relationships && this.relationships[relationName];
  },
});

export default InternalModel;
