import Backbone from 'backbone';
import getStore from './infratructure/get-store';

describe('Related methods', function () {

  it('are added to backbone models', function () {
    assert.notProperty(Backbone.Model.prototype, 'pluckRelated');
    assert.notProperty(Backbone.Model.prototype, 'getRelated');
    assert.notProperty(Backbone.Model.prototype, 'fetchRelated');
    getStore();
    assert.property(Backbone.Model.prototype, 'pluckRelated');
    assert.property(Backbone.Model.prototype, 'getRelated');
    assert.property(Backbone.Model.prototype, 'fetchRelated');
  });
});