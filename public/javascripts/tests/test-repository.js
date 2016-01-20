import Backbone from 'backbone'
import {HttpAdapter} from '../http-adapter'
import {JsonApiParser} from '../json-api-parser'
import {Repository} from '../repository'

let TestModel = Backbone.Model.extend({});
let TestCollection = Backbone.Collection.extend({
  model: TestModel
});

let createAdapter = function () {
  return new HttpAdapter('/api/user/', new JsonApiParser());
};

describe('Repository', function () {

  before(function () {
    this.repository = new Repository('test', TestCollection, createAdapter());
  });

  it('is initialized with collection', function () {
    let repo = new Repository('test', TestCollection, createAdapter());
    assert.equal(repo.collectionClass, TestCollection);
    assert.equal(repo.modelClass, TestModel);
  });

  it('is initialized with model', function () {
    let repo = new Repository('test', TestModel, createAdapter());
    assert.equal(repo.collectionClass.prototype.model, TestModel);
    assert.equal(repo.modelClass, TestModel);
  });
});