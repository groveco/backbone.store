Backbone.Model.prototype.getModelAsync = function (key, callback) {
  var relatedModels;
  if (typeof this.relatedModels === 'function') {
    relatedModels = this.relatedModels();
  } else {
    relatedModels = this.relatedModels;
  }

  var modelClass = relatedModels[key];
  var model = new modelClass();
  model.set(model.idAttribute, this.get(key));

  return model.fetch().done(function () {
    callback(model);
  });
};

Backbone.Model.prototype.getCollectionAsync = function (key, callback) {
  var relatedCollections;
  if (typeof this.relatedCollections === 'function') {
    relatedCollections = this.relatedCollections();
  } else {
    relatedCollections = this.relatedCollections;
  }

  var collectionClass = relatedCollections[key];
  var collection = new collectionClass();

  var data = {};
  data[this.relationalQueryParam] = this.id;
  return collection.fetch({
    data: data
  }).done(function () {
    callback(collection);
  });
};

var User = Backbone.Model.extend({
  urlRoot: '/api/user',
  relatedModels: function () {
    return {
      pantry: Pantry
    }
  }
});

var Pantry = Backbone.Model.extend({
  urlRoot: '/api/pantry',
  relationalQueryParam: 'pantry',
  relatedModels: {
    user: User
  },
  relatedCollections: function () {
    return {
      shipments: Shipments
    }
  }
});

var Shipment = Backbone.Model.extend({});
var Shipments = Backbone.Collection.extend({
  model: Shipment,
  url: '/api/shipments'
});

var user = new User({
  id: 12
});

// just relational

user.fetch().done(function () {
  user.getModelAsync('pantry', function (pantry) {
    console.log(pantry.get('name'));
    pantry.getCollectionAsync('shipments', function(shipments) {
      console.log(shipments);
    })
  });
});

// repository

var repository = new Repository(Backbone.Collection.extend({
  model: User
}));

repository.getById(12).done(function (user) {
  console.log(user);
  // should not send a request
  repository.getById(12).done(function (user) {
    console.log(user);
  });
});