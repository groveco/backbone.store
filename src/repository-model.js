import _ from 'underscore';
import Backbone from 'backbone';
import RSVP from 'rsvp';

let actions = {
  PLUCK: 1,
  FETCH: 2
};

let resolveRelatedMethod = function (relationName, action) {
  let modelName = this.relatedModels && this.relatedModels[relationName] || this.relatedCollections && this.relatedCollections[relationName];
  if (modelName == null) {
    throw new Error('Relation for "' + relationName + '" is not defined in the model.');
  }

  let relationship = this.get('relationships') && this.get('relationships')[relationName];
  if (relationship == null) {
    throw new Error('There is no related model "' + modelName + '".');
  }

  let link = relationship.links && relationship.links.related;
  if (link == null) {
    throw new Error('link is undefined, can\'t do that');
  }

  if (_.isArray(relationship.data)) {
    if (action === actions.FETCH) {
      return this.store.fetchCollection(link);
    } else if (action === actions.PLUCK) {
      return RSVP.all(relationship.data.map(related => {
        let {id, type} = related;
        return this.store.pluckByTypeId(type, id);
      }));
    }
  } else {
    if (action === actions.FETCH) {
      return this.store.fetch(link);
    } else if (action === actions.PLUCK) {
      let type = relationship.data && relationship.data.type;
      let id = relationship.data && relationship.data.id;
      return this.store.pluckByTypeId(type, id);
    }
  }
};

let Model = Backbone.Model.extend({
  /**
   * Get related model. If model is cached on front-end it will be returned from cache, otherwise it will be fetched.
   * @param {string} relationName - Name of relation to requested model.
   * @returns {Promise} Promise for requested model.
   */
  getRelated(relationName) {
    let plucked = resolveRelatedMethod.call(this, relationName, actions.PLUCK);
    if (plucked) {
      return plucked;
    } else {
      return resolveRelatedMethod.call(this, relationName, actions.FETCH);
    }
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
  }
});

export default Model;
