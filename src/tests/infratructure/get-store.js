import HttpAdapter from '../../http-adapter';
import JsonApiParser from '../../json-api-parser';
import Store from '../../store';

let store = null;

let createStore = function () {
  if (!store) {
    let parser = new JsonApiParser();
    let adapter = new HttpAdapter(parser);
    store = new Store(adapter);
    Store.addRelatedMethods(store);
  }
  return store;
};

export default function () {
  return createStore();
};
