import Backbone from 'backbone';

let Collection = Backbone.Collection.extend({
  modelId(attrs) {
    return attrs._self;
  }
});

export default Collection;
