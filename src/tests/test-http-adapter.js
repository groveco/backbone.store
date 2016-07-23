import $ from 'jquery'
import CamelCaseDashConverter from '../camelcase-dash'
import HttpAdapter from '../http-adapter'
import JsonApiParser from '../json-api-parser'

describe('HTTP adapter', function () {
  before(function () {
    let converter = new CamelCaseDashConverter();
    this.parser = new JsonApiParser(converter);
    this.adapter = new HttpAdapter(this.parser);
    sinon.stub($, "ajax");
  });

  after(function () {
    $.ajax.restore()
  });

  describe('#get', function () {
    it('calls AJAX on get', function () {
      let url = '/api/user/42/';
      let spy = chai.spy.on(this.adapter, '_ajax');
      this.adapter.get(url);
      spy.should.have.been.called.with(url);
    });

    it('calls AJAX get with correct data', function () {
      let link = '/foo';
      let data = {
        foo: 'bar'
      };
      this.adapter._ajax('GET', link, data);
      sinon.assert.calledWithMatch($.ajax, {
        url: link,
        type: 'GET',
        headers: {
          Accept: 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json'
        },
        data: data
      });
    });
  })

  describe('#create', function () {
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
      spy.should.have.been.called.with('POST', link, this.parser.serialize({
        data: attrs
      }));
    });

    it('calls AJAX post with stringified data', function () {
      let link = '/foo';
      let data = {
        foo: 'bar'
      };
      this.adapter._ajax('POST', link, data);
      sinon.assert.calledWithMatch($.ajax, {
        url: link,
        type: 'POST',
        headers: {
          Accept: 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json'
        },
        data: JSON.stringify(data)
      });
    });
  })

  describe('#update', function () {
    it('calls AJAX patch on update', function () {
      let link = '/foo';
      let attrs = {
        foo: 'bar',
        foo2: {
          foo3: 42
        }
      };
      let spy = chai.spy.on(this.adapter, '_ajax');
      this.adapter.update(link, attrs);
      spy.should.have.been.called.with('PATCH', link, this.parser.serialize({
        data: attrs
      }));
    });

    it('calls AJAX patch with stringified data', function () {
      let link = '/foo';
      let data = {
        foo: 'bar'
      };
      this.adapter._ajax('PATCH', link, data);
      sinon.assert.calledWithMatch($.ajax, {
        url: link,
        type: 'PATCH',
        headers: {
          Accept: 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json'
        },
        data: JSON.stringify(data)
      });
    });
  })

  describe('#destroy', function () {
    it('calls AJAX delete on destroy', function () {
      let link = '/foo';
      let spy = chai.spy.on(this.adapter, '_ajax');
      this.adapter.destroy(link);
      spy.should.have.been.called.with(link, 'DELETE');
    });
  })
});
