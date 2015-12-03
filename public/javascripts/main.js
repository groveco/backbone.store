Backbone.Model.prototype.idSuffix = 'Id';

Backbone.Model.prototype.getAsync = function (key, callback) {
  var relatedModels;
  if (typeof this.relatedModels === 'function') {
    relatedModels = this.relatedModels();
  } else {
    relatedModels = this.relatedModels;
  }

  var modelClass = relatedModels[key];
  var model = new modelClass();
  model.set(model.idAttribute, key + this.idSuffix);

  var deferredModel = model.fetch().done(function () {
    callback(model);
  });

  return deferredModel;
};

var User = Backbone.Model.extend({
  url: '/users/user',
  relatedModels: function () {
    return {
      pantry: Pantry
    }
  }
});

var Pantry = Backbone.Model.extend({
  url: '/users/pantry',
  relatedModels: function () {
    return {
      user: User
    }
  }
});

var user = new User({
  id: 12
});

user.fetch().done(function () {
  user.getAsync('pantry', function (pantry) {
    alert(pantry.get('name'));
  });
});