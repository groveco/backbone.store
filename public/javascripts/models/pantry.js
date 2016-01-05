import {User} from './user';
import {Shipment} from './shipment';
import Backbone from 'backbone';

let Pantry = Backbone.Model.extend({
  relationalQueryParam: 'pantry',
  relatedModels: {
    user: User
  },
  relatedCollections: {
    shipments: Shipment
  }
});

export {Pantry};