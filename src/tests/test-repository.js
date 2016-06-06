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
    let key = 'foo-1';
    let model = new TestModel({
      id: id,
      _self: self
    });
    this.repository.set(key, model);
    assert.lengthOf(Object.keys(this.repository._collection), 1);
    assert.equal(this.repository._collection[key].id, id);
    assert.equal(this.repository._collection[key].get('_self'), self);
  });

  it('updates model in cache collection', function () {
    let id = 42;
    let self = '/foo';
    let key = 'foo-1';
    let model = new TestModel({
      id: id,
      foo: 'bar',
      removed: 'foo',
      _self: self
    });
    this.repository.set(key, model);
    let foo = 'bar2';
    let model2 = new TestModel({
      id: id,
      foo: foo,
      _self: self
    });
    this.repository.set(key, model2);
    assert.lengthOf(Object.keys(this.repository._collection), 1);
    assert.deepEqual(this.repository._collection[key].toJSON(), model2.toJSON());
  });

  it('gets model from cache collection', function () {
    let id = 42;
    let self = '/foo';
    let key = 'foo-1';
    let model = new TestModel({
      id: id,
      _self: self
    });
    this.repository.set(key, model);
    let got = this.repository.get(key, self);
    assert.equal(model, got);
  });

  it('removes model from cache collection', function () {
    let id = 42;
    let self = '/foo';
    let key = 'foo-1';
    let model = new TestModel({
      id: id,
      _self: self
    });
    this.repository.set(key, model);
    assert.lengthOf(Object.keys(this.repository._collection), 1);
    this.repository.remove(key);
    assert.lengthOf(Object.keys(this.repository._collection), 0);
  });
});