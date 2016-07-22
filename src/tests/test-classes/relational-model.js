import Backbone from 'backbone';

let RelationalModel = Backbone.Model.extend({
  relatedModels: {
    test: 'test'
  },
  relatedCollections: {
    tests: 'test'
  }
});

export default RelationalModel;
