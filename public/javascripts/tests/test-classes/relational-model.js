import Backbone from 'backbone';

let RelationalModel = Backbone.Model.extend({
  relatedModels: {
    test: 'test'
  }
});

export {RelationalModel};