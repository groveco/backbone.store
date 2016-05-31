import $ from 'jquery'
import CamelCaseDashConverter from '../camelcase-dash'
import HttpAdapter from '../http-adapter'
import HttpMethods from '../http-methods'
import JsonApiParser from '../json-api-parser'

describe('HTTP adapter', function () {

  before(function () {
    let converter = new CamelCaseDashConverter();
    let parser = new JsonApiParser(converter);
    this.adapter = new HttpAdapter(parser);
    sinon.stub($, "ajax");
  });

  after(function () {
    $.ajax.restore()
  });

  it('calls AJAX on get', function () {
    let url = '/api/user/42/';
    let spy = chai.spy.on(this.adapter, '_ajax');
    this.adapter.get(url);
    spy.should.have.been.called.with(url);
  });

  it('calls AJAX post on create', function () {
    let link = '/foo';
    let attrs = {
      foo: 'bar',
      foo2: {
        foo3: 42
      }
    };
    let spy = chai.spy.on(this.adapter, '_ajax');
    this.adapter.create(link, attrs);
    spy.should.have.been.called.with(link, HttpMethods.POST, this.adapter._parser.serialize({
      data: attrs
    }));
  });

  it('calls AJAX put on update', function () {
    let link = '/foo';
    let attrs = {
      foo: 'bar',
      foo2: {
        foo3: 42
      }
    };
    let spy = chai.spy.on(this.adapter, '_ajax');
    this.adapter.update(link, attrs);
    spy.should.have.been.called.with(link, HttpMethods.PATCH, this.adapter._parser.serialize({
      data: attrs
    }));
  });

  it('calls AJAX delete on destroy', function () {
    let self = '/foo';
    let spy = chai.spy.on(this.adapter, '_ajax');
    this.adapter.destroy(self);
    spy.should.have.been.called.with(self, HttpMethods.DELETE);
  });

  it('calls AJAX get with correct data', function () {
    let link = '/foo';
    let data = {
      foo: 'bar'
    };
    this.adapter._ajax(link, HttpMethods.GET, data);
    assert($.ajax.calledWithMatch({
      url: link,
      type: HttpMethods.GET,
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json'
      },
      data: data
    }));
  });

  it('calls AJAX post with stringified data', function () {
    let link = '/foo';
    let data = {
      foo: 'bar'
    };
    this.adapter._ajax(link, HttpMethods.POST, data);
    assert($.ajax.calledWithMatch({
      url: link,
      type: HttpMethods.POST,
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json'
      },
      data: JSON.stringify(data)
    }));
  });
});