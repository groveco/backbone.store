import {Pantry} from './pantry';
let Backbone = require('backbone');

let Shipment = Backbone.Model.extend({
  relatedModels: {
    pantry: Pantry
  }
});

export {Shipment};