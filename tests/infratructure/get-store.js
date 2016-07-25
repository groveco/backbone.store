import HttpAdapter from '../../src/http-adapter';
import JsonApiParser from '../../src/json-api-parser';
import Store from '../../src/store';

let store = null;

let createStore = function () {
  if (!store) {
    let parser = new JsonApiParser();
    let adapter = new HttpAdapter(parser);
    store = new Store(adapter);
  }
  return store;
};

export default function () {
  return createStore();
};
