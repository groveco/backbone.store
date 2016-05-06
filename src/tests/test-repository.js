import Backbone from 'backbone'
import Repository from '../repository'

let TestModel = Backbone.Model.extend({});
let TestCollection = Backbone.Collection.extend({
  model: TestModel
});

describe('Repository', function () {
  beforeEach(function () {
    this.repository = new Repository(TestCollection);
  });

  it('is initialized with collection', function () {
    let repository = new Repository(TestCollection);
    assert.equal(repository.collectionClass, TestCollection);
    assert.equal(repository.modelClass, TestModel);
    assert.isOk(repository._collection instanceof TestCollection);
  });

  it('is initialized with model', function () {
    let repository = new Repository(TestModel);
    assert.equal(repository.modelClass, TestModel);
    assert.isOk(repository._collection instanceof Backbone.Collection);
  });

  it('creates model', function () {
    let model = this.repository.createModel();
    assert.isOk(model instanceof TestModel);
  });

  it('creates model with attributes', function () {
    let attr = {
      foo: 'bar'
    };
    let model = this.repository.createModel(attr);
    assert.deepEqual(model.toJSON(), attr);
  });

  it('creates collection', function () {
    let collection = this.repository.createCollection();
    assert.isOk(collection instanceof TestCollection);
  });

  it('creates collection with models', function () {
    let models = [{
      foo: 'bar'
    }, {
      foo1: 'bar1'
    }];
    let collection = this.repository.createCollection(models);
    assert.isOk(collection.map(function (model) { return model.toJSON() }), models);
  });

  it('sets model to cache collection', function () {
    let id = 42;
    let model = new TestModel({
      id: id
    });
    this.repository.set(model);
    assert.equal(this.repository._collection.length, 1);
    assert.equal(this.repository._collection.pluck('id')[0], id);
  });

  it('updates model in cache collection', function () {
    let id = 42;
    let model = new TestModel({
      id: id,
      foo: 'bar'
    });
    this.repository.set(model);
    let foo = 'bar2';
    let model2 = new TestModel({
      id: id,
      foo: 'bar2'
    });
    this.repository.set(model2);
    assert.equal(this.repository._collection.length, 1);
    assert.equal(this.repository._collection.pluck('foo')[0], foo);
  });

  it('gets model from cache collection', function () {
    let id = 42;
    let model = new TestModel({
      id: id
    });
    this.repository.set(model);
    let got = this.repository.get(id);
    assert.equal(model, got);
  });

  it('removes model from cache collection', function () {
    let id = 42;
    let model = new TestModel({
      id: id
    });
    this.repository.set(model);
    assert.equal(this.repository._collection.length, 1);
    this.repository.remove(id);
    assert.equal(this.repository._collection.length, 0);
  });
});