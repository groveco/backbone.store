import Backbone from 'backbone';

let Collection = Backbone.Collection.extend({
  modelId(attributes) {
    return `${attributes._type}__${attributes.id}`;
  }
});

export default Collection;
