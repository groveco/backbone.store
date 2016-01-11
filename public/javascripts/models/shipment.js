import Backbone from 'backbone'

let Shipment = Backbone.Model.extend({
  relatedModels: {
    pantry: 'pantry'
  }
});

export {Shipment};