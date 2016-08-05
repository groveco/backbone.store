import _ from 'underscore';
import {Model} from 'backbone';
import CollectionProxy from './collection-proxy';
import ModelProxy from './model-proxy';

let InternalModel = Model.extend({
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
    let modelName = this.relatedModels && this.relatedModels[relationName] || this.relatedCollections && this.relatedCollections[relationName];
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
    return this.store.fetch(link);
  },

  /**
   * Get related model from front-end cache.
   * @param {string} relationName - Name of relation to requested model.
   * @returns {Promise} Promise for requested model.
   */
  peekRelated(relationName) {
    let relationship = this.getRelationship(relationName);
    if (this.getRelationshipType(relationName) === 'has-many') {
      return this.store.peekManyByType(relationship.data);
    } else if (relationship.data) {
      return this.store.peekByType(relationship.data.type, relationship.data.id);
    }
  }
});

export default InternalModel;
