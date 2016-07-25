import Backbone from 'backbone';
import RSVP from 'rsvp';

let actions = {
  GET: 0,
  PLUCK: 1,
  FETCH: 2
};

let resolveRelatedMethod = function (relationName, action) {
  let isCollection = false;
  let modelName = this.relatedModels && this.relatedModels[relationName];
  if (!modelName) {
    modelName = this.relatedCollections && this.relatedCollections[relationName];
    isCollection = true;
  }
  if (!modelName) {
    throw new Error('Relation for "' + relationName + '" is not defined in the model.');
  }

  let relationship = this.get('relationships') && this.get('relationships')[relationName];
  if (!relationship) {
    throw new Error('There is no related model "' + modelName + '".');
  }

  let link = relationship.links && relationship.links.related;
  let type = relationship.data && relationship.data.type;
  let id = relationship.data && relationship.data.id;

  if (link) {
    if (isCollection) {
      if (action == actions.FETCH) {
        return this.store.getCollection(link);
      } else {
        throw new Error('Collection should be fetched. Use "fetchRelated".');
      }
    } else if (type && id) {
      if (action === actions.GET) {
        let existing = this.store.pluckByTypeId(type, id);
        if (existing) {
          return new RSVP.Promise(resolve => resolve(existing));
        } else {
          return this.store.fetch(link);
        }
      } else if (action === actions.FETCH) {
        return this.store.fetch(link);
      } else if (action === actions.PLUCK) {
        return this.store.pluckByTypeId(type, id);
      } else {
        throw new Error('Unknown action');
      }
    }
  }
  throw new Error('link is undefined, can\'t do that')
};

let Model = Backbone.Model.extend({
  /**
   * Get related model. If model is cached on front-end it will be returned from cache, otherwise it will be fetched.
   * @param {string} relationName - Name of relation to requested model.
   * @returns {Promise} Promise for requested model.
   */
  getRelated(relationName) {
    return resolveRelatedMethod.call(this, relationName, actions.GET);
  },

  /**
   * Fetch related model or collection from server.
   * @param {string} relationName - Name of relation to requested model or collection.
   * @returns {Promise} Promise for requested model or collection.
   */
  fetchRelated(relationName) {
    return resolveRelatedMethod.call(this, relationName, actions.FETCH);
  },

  /**
   * Get related model from front-end cache.
   * @param {string} relationName - Name of relation to requested model.
   * @returns {Promise} Promise for requested model.
   */
  pluckRelated(relationName) {
    return resolveRelatedMethod.call(this, relationName, actions.PLUCK);
  },
});

export default Model;
