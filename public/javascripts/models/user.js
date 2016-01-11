import Backbone from 'backbone'

let User = Backbone.Model.extend({
  relatedModels: {
    pantry: 'pantry'
  }
});

export {User};