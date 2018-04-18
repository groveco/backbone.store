import Backbone from 'backbone'
import Repository from '../src/repository'

let TestModel = Backbone.Model.extend({})
let TestCollection = Backbone.Collection.extend({
  model: TestModel
})

describe('Repository', function () {
  let repository
  beforeEach(function () {
    repository = new Repository(TestCollection)
  })

  it('sets model to cache collection', function () {
    let id = 42
    let self = '/foo'
    let model = new TestModel({
      id: id,
      _self: self
    })
    repository.set(model)
    expect(repository._collection).toHaveLength(1)
    expect(repository._collection.pluck('id')[0]).toEqual(id)
    expect(repository._collection.pluck('_self')[0]).toEqual(self)
  })

  it('updates model in cache collection', function () {
    let id = 42
    let self = '/foo'
    let model = new TestModel({
      id: id,
      foo: 'bar',
      removed: 'foo',
      _self: self
    })
    repository.set(model)
    let foo = 'bar2'
    let model2 = new TestModel({
      id: id,
      foo: foo,
      _self: self
    })
    repository.set(model2)
    expect(repository._collection.length).toEqual(1)
    expect(repository._collection.at(0).toJSON()).toEqual(model2.toJSON())
  })

  it('gets model from cache collection', function () {
    let id = 42
    let self = '/foo'
    let model = new TestModel({
      id: id,
      _self: self
    })
    repository.set(model)
    let got = repository.get(self)
    expect(model).toEqual(got)
  })

  it('removes model from cache collection', function () {
    let id = 42
    let self = '/foo'
    let model = new TestModel({
      id: id,
      _self: self
    })
    repository.set(model)
    expect(repository._collection).toHaveLength(1)
    repository.remove(self)
    expect(repository._collection).toHaveLength(0)
  })
})
