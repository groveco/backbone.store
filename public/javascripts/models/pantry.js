import Backbone from 'backbone'

let Pantry = Backbone.Model.extend({
  relatedModels: {
    user: 'user'
  },
  relatedCollections: {
    shipments: 'shipment'
  }
});

export {Pantry};