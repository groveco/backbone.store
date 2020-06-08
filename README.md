# Backbone Store

Backbone Store is a library for managing and caching data in Backbone applications.

## Contributing to Backbone Store

If you're using `@groveco/backbone.store` in your own project:

1. Clone this repo locally, e.g.
  ```sh
  $> git clone https://github.com/groveco/backbone.store ~/Projects/backbone.store && cd $_
  Cloning https://github.com/groveco/backbone.store into ~/Projects/backbone.store
  . . .
  cd ~/Projects/backbone.store
  $> pwd
  ~/Projects/backbone.store
  ```
2. Link your work-tree as the globally installed package:
  ```sh
  $> pwd
  ~/Projects/backbone.store
  $> npm link
  npm install...
  linking @groveco/backbone.store
  $> npm ls --global --depth=0
  /path/to/global/node_modules
  ├── @groveco/backbone.store@X.Y.Z -> ~/Projects/backbone.store
  ├── nodemon@1.18.9
  └── npm@6.1.0
  ```
3. Link the globally linked version of `backbone.store` in the work-tree of the project that is consuming `backbone.store`:
  ```sh
  $> pwd
  ~/Projects/backbone.store
  $> pushd ../other-project ## e.g. `groveco/grove`
  ~/Projects/other-project  ~/Projects/backbone.store
  $> npm link @groveco/backbone.store
  ~/other-project/node_modules/@groveco/backbone.store -> /path/to/global/node_modules/@groveco/backbone.store -> ~/Projects/backbone.store
  ```
4. Switch back to your local clone of `groveco/backbone.store` and get to work!
  ```sh
  $> pwd
  ~/Projects/other-project
  $> popd
  ~/Projects/backbone.store
  ```

5. Rebuild `other-project` to pick up the changes to `backbone.store`

> **Caveat:** Running `npm install` in `other-project` will destroy the link
> that you made in Step 3 above, so if your build process runs `npm install`,
> you'll have to rerun `npm link` per Step 3 after the build starts... or pass
> `--link` to `npm install`.

> **Caveat:**  If running `other-project` inside of a container, using `npm link`
> may prove difficult to link dependencies between local and containered environments. 
> One may need to clone this repository within the container and run steps 1-5. 
> This is not recommended, but may be inevitable depending on the use case.

## Using Backbone Store

### Defining models

Backbone Store provides relational models structure. To define relations between models use `relatedModels` and
`relatedCollections` fields in Backbone.Model.

For instance we have blogs with comments:

```javascript
import Backbone from 'backbone'

let Blog = Backbone.Model.extend({
  relatedCollections: {
    comments: 'comment'
  }
});

let Comment = Backbone.Model.extend({
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

That's how you create a repository with adapter and parser:

```javascript
import BackboneStore from 'backbone.store'
import BlogModel from './path/to/blog-model'

let parser = new BackboneStore.JsonApiParser();
let adapter = new BackboneStore.HttpAdapter('/api/blog/', parser);
let repo = new BackboneStore.Repository(BlogModel, adapter);
```
