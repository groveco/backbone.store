import Backbone from 'backbone'
import BackboneStore from '../../../src/index'
import RSVP from 'rsvp'

var Customer = Backbone.Model.extend({
  relatedModels: {
    pantry: 'pantry'
  }
});

var Pantry = Backbone.Model.extend({
  relatedModels: {
    user: 'user'
  },
  relatedCollections: {
    shipments: 'shipment'
  }
});

var Shipment = Backbone.Model.extend({
  relatedModels: {
    pantry: 'pantry'
  },
  relatedCollections: {
    'shipment-items': 'shipment-item'
  }
});

var ShipmentItem = Backbone.Model.extend({
  relatedModels: {
    pantry: 'shipment'
  }
});

var repositoryFactory = function (modelClass, url) {
  var parser = new BackboneStore.JsonApiParser();
  var adapter = new BackboneStore.HttpAdapter(url, parser);
  return new BackboneStore.Repository(modelClass, adapter);
};

var store = BackboneStore.Store.instance();
var userRepository = repositoryFactory(Customer, '/api/customer/');
var pantryRepository = repositoryFactory(Pantry, '/api/pantry/');
var shipmentRepository = repositoryFactory(Shipment, '/api/shipment/');
var shipmentItemRepository = repositoryFactory(ShipmentItem, '/api/shipment/');

store.register('user', userRepository);
store.register('pantry', pantryRepository);
store.register('shipment', shipmentRepository);
store.register('shipment-item', shipmentItemRepository);

var repo = store.getRepository('user');
var deferred = repo.get(12, 'data/customer.json');
deferred.then(function (model) {
  console.log('customer ->');
  console.log(model);
  return model.getAsync('pantry')
}).then(function (pantry) {
  console.log('pantry ->');
  console.log(pantry);
  return pantry.getAsync('shipments')
}).then(function (shipments) {
  console.log('shipments ->');
  console.log(shipments);
  var deferredShipmentItems = shipments.map(function (shipment) {
    return shipment.getAsync('shipment-items');
  });
  return RSVP.all(deferredShipmentItems)
}).then(function (shipmentItemsCollections) {
  shipmentItemsCollections.forEach(function (shipmentItems) {
    console.log('shipment itemss ->');
    console.log(shipmentItems);
  })
});