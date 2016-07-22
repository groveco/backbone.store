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

  it('sets model to cache collection', function () {
    let id = 42;
    let self = '/foo';
    let model = new TestModel({
      id: id,
      _self: self
    });
    this.repository.set(model);
    assert.lengthOf(this.repository._collection, 1);
    assert.equal(this.repository._collection.pluck('id')[0], id);
    assert.equal(this.repository._collection.pluck('_self')[0], self);
  });

  it('doesn\'t set model to cache collection if it doesn\'t have _self', function () {
    let model = new TestModel({
      id: 42
    });
    this.repository.set(model);
    assert.lengthOf(this.repository._collection, 0);
  });

  it('updates model in cache collection', function () {
    let id = 42;
    let self = '/foo';
    let model = new TestModel({
      id: id,
      foo: 'bar',
      removed: 'foo',
      _self: self
    });
    this.repository.set(model);
    let foo = 'bar2';
    let model2 = new TestModel({
      id: id,
      foo: foo,
      _self: self
    });
    this.repository.set(model2);
    assert.equal(this.repository._collection.length, 1);
    assert.deepEqual(this.repository._collection.at(0).toJSON(), model2.toJSON());
  });

  it('gets model from cache collection', function () {
    let id = 42;
    let self = '/foo';
    let model = new TestModel({
      id: id,
      _self: self
    });
    this.repository.set(model);
    let got = this.repository.get(self);
    assert.equal(model, got);
  });

  it('removes model from cache collection', function () {
    let id = 42;
    let self = '/foo';
    let model = new TestModel({
      id: id,
      _self: self
    });
    this.repository.set(model);
    assert.equal(this.repository._collection.length, 1);
    this.repository.remove(self);
    assert.equal(this.repository._collection.length, 0);
  });
});
