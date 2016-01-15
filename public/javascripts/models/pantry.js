import Backbone from 'backbone'

let Pantry = Backbone.Model.extend({
  relatedModels: {
    user: 'user'
  }
});

export {Pantry};