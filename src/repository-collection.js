import Backbone from 'backbone';
import Model from './internal-model';

let Collection = Backbone.Collection.extend({
  model: Model,
  modelId(attributes) {
    return `${attributes._type}__${attributes.id}`;
  }
});

export default Collection;
