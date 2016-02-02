import $ from 'jquery'
import Backbone from 'backbone'
import {HttpAdapter} from '../http-adapter'
import {JsonApiParser} from '../json-api-parser'
import {Repository} from '../repository'
import {FakeAdapter} from './test-classes/adapter'

let TestModel = Backbone.Model.extend({});
let TestCollection = Backbone.Collection.extend({
  model: TestModel
});

let createAdapter = function () {
  return new HttpAdapter('/api/user/', new JsonApiParser());
};

describe('Repository', function () {

  beforeEach(function () {
    let adapter = createAdapter();
    this.repository = new Repository(TestCollection, adapter);
    this.fakeRepository = new Repository(TestCollection, new FakeAdapter());
  });

  it('is initialized with collection', function () {
    let repo = new Repository(TestCollection, createAdapter());
    assert.equal(repo.collectionClass, TestCollection);
    assert.equal(repo.modelClass, TestModel);
  });

  it('is initialized with model', function () {
    let repo = new Repository(TestModel, createAdapter());
    assert.equal(repo.collectionClass.prototype.model, TestModel);
    assert.equal(repo.modelClass, TestModel);
  });

  it('calls adapter\'s getById method on own getById', function () {
    let id = 42;
    let spy = chai.spy.on(this.repository._adapter, 'getById');
    this.repository.getById(id);
    spy.should.have.been.called.with(id);
  });

  it('calls adapter\'s getByLink method on own getByLink', function () {
    let id = 42;
    let link = '/api/user/42/';
    let spy = chai.spy.on(this.repository._adapter, 'getByLink');
    this.repository.getByLink(id, link);
    spy.should.have.been.called.with(link);
  });

  it('calls adapter\'s getByLink method on own getCollectionByLink', function () {
    let id = 42;
    let link = '/api/user/42/';
    let spy = chai.spy.on(this.repository._adapter, 'getByLink');
    this.repository.getCollectionByLink(link);
    spy.should.have.been.called.with(link);
  });

  it('calls adapter\'s create method on own create', function () {
    let attrs = {
      name: 'foo'
    };
    let spy = chai.spy.on(this.repository._adapter, 'create');
    this.repository.create(attrs);
    spy.should.have.been.called.with(attrs);
  });

  it('calls adapter\'s update method on own update', function () {
    let model = new Backbone.Model({
      id: 42,
      slug: 'bar'
    });
    let initialAttrs = model.toJSON();
    let attrs = {
      name: 'foo'
    };
    let spy = chai.spy.on(this.repository._adapter, 'update');
    this.repository.update(model, attrs);
    Object.assign(initialAttrs, attrs);
    spy.should.have.been.called.with(model.id, initialAttrs);
  });

  it('calls adapter\'s destroy method on own destroy if model is cached', function () {
    let id = 42;
    let model = new Backbone.Model({
      id: id
    });
    this.repository.collection.add(model);
    let spy = chai.spy.on(this.repository._adapter, 'destroy');
    this.repository.destroy(id);
    spy.should.have.been.called.with(id);
  });

  it('does not call adapter\'s destroy method on own destroy if model is not cached', function () {
    let id = 42;
    let spy = chai.spy.on(this.repository._adapter, 'destroy');
    this.repository.destroy(id);
    spy.should.not.have.been.called();
  });

  it('adds model to cache on getById', function () {
    let id = 42;
    this.fakeRepository.getById(id);
    assert.include(this.fakeRepository.collection.pluck('id'), id);
  });

  it('adds model to cache on getByLink', function () {
    let link = '/api/user/1/';
    this.fakeRepository.getByLink(link);
    assert.lengthOf(this.fakeRepository.collection, 1);
  });

  it('adds models to cache on getCollectionByLink', function () {
    let link = '/api/user/1/';
    let collection = [{
      id: 1,
      name: 'foo1'
    }, {
      id: 2,
      name: 'foo2'
    }, {
      id: 3,
      name: 'foo3'
    }];
    this.fakeRepository._adapter.getByLink = function () {
      let deferred = $.Deferred();
      deferred.resolve(collection);
      return deferred;
    };
    this.fakeRepository.getCollectionByLink(link);
    assert.lengthOf(this.fakeRepository.collection, collection.length);
  });

  it('adds model to cache on create', function () {
    let attrs = {
      name: 'foo'
    };
    this.fakeRepository.create(attrs);
    assert.lengthOf(this.fakeRepository.collection, 1);
  });

  it('updates model in cache on update', function (done) {
    let attrs = {
      name: 'foo'
    };
    this.fakeRepository.create(attrs).then((model) => {
      let newAttrs = {
        name: 'foo2'
      };
      this.fakeRepository.update(model, newAttrs).then((model) => {
        assert.lengthOf(this.fakeRepository.collection, 1);
        assert.equal(this.fakeRepository.collection.at(0).get('name'), newAttrs.name);
        done();
      });
    });
  });

  it('removes model from cache on destroy', function (done) {
    let attrs = {
      name: 'foo'
    };
    this.fakeRepository.create(attrs).then((model) => {
      this.fakeRepository.destroy(model.id).then((model) => {
        assert.lengthOf(this.fakeRepository.collection, 0);
        done();
      });
    });
  });
});