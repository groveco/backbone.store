import {Pantry} from './pantry';
let Backbone = require('backbone');

let User = Backbone.Model.extend({
  relatedModels: {
    pantry: Pantry
  }
});

export {User};