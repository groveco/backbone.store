import {JsonApiHttpAdapter} from './json-api-http-adapter'
import {Repository} from './repository'

let factory = (modelClass, url) => {
  let adapter = new JsonApiHttpAdapter(url);
  let repository = new Repository(modelClass, adapter);
  return repository;
};

export {factory};