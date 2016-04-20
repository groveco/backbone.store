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
  }
});

var User = Backbone.Model.extend({
  relatedModels: {
    pantry: 'pantry'
  }
});

var repositoryFactory = function (modelClass, url) {
  var parser = new BackboneStore.JsonApiParser();
  var adapter = new BackboneStore.HttpAdapter(url, parser);
  return new BackboneStore.Repository(modelClass, adapter);
};

var store = BackboneStore.Store.instance();
var userRepository = repositoryFactory(User, '/api/user/');
var pantryRepository = repositoryFactory(Pantry, '/api/pantry/');
var shipmentRepository = repositoryFactory(Shipment, '/api/shipment/');

store.register('user', userRepository);
store.register('pantry', pantryRepository);
store.register('shipment', shipmentRepository);

var repo = store.getRepository('user');
var deferred = repo.get(12, 'data/user.json');
deferred.then(function (model) {
  console.log('user ->');
  console.log(model);
  model.getRelated('pantry').then(function (pantry) {
    console.log('pantry ->');
    console.log(pantry);
  })
});