import {HttpAdapter} from '../http-adapter'
import {HttpMethods} from '../http-methods'
import {JsonApiParser} from '../json-api-parser'

describe('HTTP adapter', function () {

  before(function () {
    this.adapter = new HttpAdapter('/api/user/', new JsonApiParser());
  });

  it('calls AJAX get on findById', function () {
    let id = 42;
    let spy = chai.spy.on(this.adapter, '_ajax');
    this.adapter.getById(id);
    spy.should.have.been.called.with(id, HttpMethods.GET);
  });
});