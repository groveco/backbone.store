# Backbone Store

Backbone Store is a library for managing and caching data in Backbone applications.

## Using Backbone Store

### Defining models

Backbone Store provides relational models structure. To define relations between models use `relatedModels` and
`relatedCollections` fields in Backbone.Model.

For instance we have blogs with comments:

```js
import Backbone from 'backbone'

let Blog = Backbone.Model.extend({
  relatedCollections: {
    comments: 'comment'
  }
});

var Comment = Backbone.Model.extend({
  relatedModels: {
    blog: 'blog'
  }
});
```

Here in `relatedModels` and `relatedCollections` objects keys are fields in model where we can find location of related
model/collection (id or url). Values are types of related model.

### Adapter

Adapter is a thing which knows how to manipulate with data on server (or even other sources in general). Currently there
is HttpAdapter which manipulates data with server over HTTP.

### Parser

Parser is class which parses data from server from specific format to Backbone Store format and vice versa. Currently
there is JsonApiParser which parses data from [JSON API](http://jsonapi.org/) format.

### Repository

Repository is used to provide access to data and cache data on front-end to prevent same multiple requests.

### Instantiating a Store

Store is a singleton with 'private' constructor. To get a Store instance use `instance` static method:

```js
import BackboneStore from 'backbone.store'

let store = BackboneStore.Store.instance()
```

### Putting everything together

You can see examples [here](https://github.com/groveco/backbone.store/tree/master/example).