import _ from 'underscore'
import Backbone from 'backbone'
import RSVP from 'rsvp'
import Repository from '../repository'
import FakeAdapter from './test-classes/adapter'

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

// describe('Repository', function () {
//
//   beforeEach(function () {
//     this.fakeRepository = new Repository(TestCollection, new FakeAdapter());
//   });
//
//   it('is initialized with collection', function () {
//     let repo = new Repository(TestCollection, new FakeAdapter());
//     assert.equal(repo.collectionClass, TestCollection);
//     assert.equal(repo.modelClass, TestModel);
//   });
//
//   it('is initialized with model', function () {
//     let repo = new Repository(TestModel, new FakeAdapter());
//     assert.equal(repo.collectionClass.prototype.model, TestModel);
//     assert.equal(repo.modelClass, TestModel);
//   });
//
//   it('calls adapter\'s getById method on own get with Id', function () {
//     let id = 42;
//     let spy = chai.spy.on(this.fakeRepository._adapter, 'getById');
//     this.fakeRepository.get(id);
//     spy.should.have.been.called.with(id);
//   });
//
//   it('calls adapter\'s getByLink method on own get with Id and link', function () {
//     let id = 42;
//     let link = '/api/user/42/';
//     let spy = chai.spy.on(this.fakeRepository._adapter, 'getByLink');
//     this.fakeRepository.get(id, link);
//     spy.should.have.been.called.with(link);
//   });
//
//   it('calls adapter\'s getByLink method once on multiple own get with Id and link', function (done) {
//     let id = 42;
//     let link = '/api/user/42/';
//     let spy = chai.spy.on(this.fakeRepository._adapter, 'getByLink');
//     this.fakeRepository.get(id, link).then(() => {
//       this.fakeRepository.get(id, link);
//       spy.should.have.been.called.once();
//       done();
//     });
//   });
//
//   it('calls adapter\'s getByLink method on own getCollectionByLink', function () {
//     let id = 42;
//     let link = '/api/user/42/';
//     let spy = chai.spy.on(this.fakeRepository._adapter, 'getByLink');
//     this.fakeRepository.getCollectionByLink(link);
//     spy.should.have.been.called.with(link);
//   });
//
//   it('calls adapter\'s getByLink method on own fetch with link', function () {
//     let id = 42;
//     let link = '/api/user/42/';
//     let spy = chai.spy.on(this.fakeRepository._adapter, 'getByLink');
//     this.fakeRepository.fetch(id, link);
//     spy.should.have.been.called.with(link);
//   });
//
//   it('calls adapter\'s getByLink method every time own fetch with link is called', function () {
//     let id = 42;
//     let link = '/api/user/42/';
//     let spy = chai.spy.on(this.fakeRepository._adapter, 'getByLink');
//     this.fakeRepository.fetch(id, link).then(() => {
//       this.fakeRepository.fetch(id, link);
//       spy.should.have.been.called.twice();
//     });
//   });
//
//   it('doesn\'t call any adapter\'s get method on own pluck call', function () {
//     let spyByLink = chai.spy.on(this.fakeRepository._adapter, 'getByLink');
//     let spyById = chai.spy.on(this.fakeRepository._adapter, 'getById');
//     this.fakeRepository.pluck(42);
//     spyByLink.should.not.have.been.called();
//     spyById.should.not.have.been.called();
//   });
//
//   it('pluck doesn\'t return not cached data', function () {
//     let model = this.fakeRepository.pluck(42);
//     assert.isUndefined(model);
//   });
//
//   it('pluck returns cached data', function (done) {
//     let id = 42;
//     let link = `/api/user/${id}/`;
//     this.fakeRepository.get(id, link).then(() => {
//       let model = this.fakeRepository.pluck(id);
//       assert.isObject(model);
//       done();
//     });
//   });
//
//   it('calls adapter\'s create method on own create', function () {
//     let attrs = {
//       name: 'foo'
//     };
//     let spy = chai.spy.on(this.fakeRepository._adapter, 'create');
//     this.fakeRepository.create(attrs);
//     spy.should.have.been.called.with(attrs);
//   });
//
//   it('calls adapter\'s update method on own update', function () {
//     let model = new Backbone.Model({
//       id: 42,
//       slug: 'bar'
//     });
//     let initialAttrs = model.toJSON();
//     let attrs = {
//       name: 'foo'
//     };
//     let spy = chai.spy.on(this.fakeRepository._adapter, 'update');
//     this.fakeRepository.update(model, attrs);
//     _.extend(initialAttrs, attrs);
//     spy.should.have.been.called.with(model.id, initialAttrs);
//   });
//
//   it('calls adapter\'s destroy method on own destroy if model is cached', function () {
//     let id = 42;
//     let model = new Backbone.Model({
//       id: id
//     });
//     this.fakeRepository.collection.add(model);
//     let spy = chai.spy.on(this.fakeRepository._adapter, 'destroy');
//     this.fakeRepository.destroy(id);
//     spy.should.have.been.called.with(id);
//   });
//
//   it('does not call adapter\'s destroy method on own destroy if model is not cached', function () {
//     let id = 42;
//     let spy = chai.spy.on(this.fakeRepository._adapter, 'destroy');
//     this.fakeRepository.destroy(id);
//     spy.should.not.have.been.called();
//   });
//
//   it('adds model to cache on get with Id', function (done) {
//     let id = 42;
//     this.fakeRepository.get(id).then(() => {
//       assert.include(this.fakeRepository.collection.pluck('id'), id);
//       done();
//     });
//   });
//
//   it('adds model to cache on get with Id and link', function (done) {
//     let link = '/api/user/1/';
//     this.fakeRepository.get(1, link).then(() => {
//       assert.lengthOf(this.fakeRepository.collection, 1);
//       done();
//     });
//   });
//
//   it('adds models to cache on getCollectionByLink', function (done) {
//     let link = '/api/user/1/';
//     let collection = [{
//       id: 1,
//       name: 'foo1'
//     }, {
//       id: 2,
//       name: 'foo2'
//     }, {
//       id: 3,
//       name: 'foo3'
//     }];
//     this.fakeRepository._adapter.getByLink = function () {
//       return new RSVP.Promise((resolve, reject) => {
//         resolve(collection);
//       });
//     };
//     this.fakeRepository.getCollectionByLink(link).then(() => {
//       assert.lengthOf(this.fakeRepository.collection, collection.length);
//       done();
//     });
//   });
//
//   it('adds model to cache on create', function (done) {
//     let attrs = {
//       name: 'foo'
//     };
//     this.fakeRepository.create(attrs).then(() => {
//       assert.lengthOf(this.fakeRepository.collection, 1);
//       done();
//     });
//   });
//
//   it('updates model in cache on update', function (done) {
//     let attrs = {
//       name: 'foo'
//     };
//     this.fakeRepository.create(attrs).then((model) => {
//       let newAttrs = {
//         name: 'foo2'
//       };
//       this.fakeRepository.update(model, newAttrs).then((model) => {
//         assert.lengthOf(this.fakeRepository.collection, 1);
//         assert.equal(this.fakeRepository.collection.at(0).get('name'), newAttrs.name);
//         done();
//       });
//     });
//   });
//
//   it('removes model from cache on destroy', function (done) {
//     let attrs = {
//       name: 'foo'
//     };
//     this.fakeRepository.create(attrs).then((model) => {
//       this.fakeRepository.destroy(model.id).then((model) => {
//         assert.lengthOf(this.fakeRepository.collection, 0);
//         done();
//       });
//     });
//   });
// });