import $ from 'jquery'
import {HttpAdapter} from '../http-adapter'
import {HttpMethods} from '../http-methods'
import {JsonApiParser} from '../json-api-parser'

describe('HTTP adapter', function () {

  before(function () {
    this.adapter = new HttpAdapter('/api/user/', new JsonApiParser());
    sinon.stub($, "ajax");
  });

  after(function () {
    $.ajax.restore()
  });

  it('calls AJAX get on findById', function () {
    let id = 42;
    let spy = chai.spy.on(this.adapter, '_ajax');
    this.adapter.getById(id);
    spy.should.have.been.called.with(id, HttpMethods.GET);
  });

  it('calls AJAX get by link on findByLink', function () {
    let url = '/api/user/42/';
    let spy = chai.spy.on(this.adapter, '_ajaxByLink');
    this.adapter.getByLink(url);
    spy.should.have.been.called.with(url);
  });

  it('calls AJAX post on create', function () {
    let attrs = {
      foo: 'bar',
      foo2: {
        foo3: 42
      }
    };
    let spy = chai.spy.on(this.adapter, '_ajax');
    this.adapter.create(attrs);
    spy.should.have.been.called.with(null, HttpMethods.POST, attrs);
  });

  it('calls AJAX put on update', function () {
    let id = 42;
    let attrs = {
      foo: 'bar',
      foo2: {
        foo3: 42
      }
    };
    let spy = chai.spy.on(this.adapter, '_ajax');
    this.adapter.update(id, attrs);
    spy.should.have.been.called.with(id, HttpMethods.PUT, attrs);
  });

  it('calls AJAX delete on destroy', function () {
    let id = 42;
    let spy = chai.spy.on(this.adapter, '_ajax');
    this.adapter.destroy(id);
    spy.should.have.been.called.with(id, HttpMethods.DELETE);
  });

  it('calls AJAX get with correct data', function () {
    let id = 42;
    let data = {
      foo: 'bar'
    };
    this.adapter._ajax(id, HttpMethods.GET, data);
    assert($.ajax.calledWithMatch({
      url: this.adapter._url + id + '/',
      type: HttpMethods.GET,
      contentType: 'application/vnd.api+json',
      data: data
    }));
  });

  it('calls AJAX post with stringified data', function () {
    let id = 42;
    let data = {
      foo: 'bar'
    };
    this.adapter._ajax(id, HttpMethods.POST, data);
    assert($.ajax.calledWithMatch({
      url: this.adapter._url + id + '/',
      type: HttpMethods.POST,
      contentType: 'application/vnd.api+json',
      data: JSON.stringify(data)
    }));
  });

  it('calls AJAX getByLink with correct data', function () {
    let url = '/api/user/42/';
    this.adapter._ajaxByLink(url);
    assert($.ajax.calledWithMatch({
      url: url,
      type: HttpMethods.GET,
      contentType: 'application/vnd.api+json'
    }));
  });
});