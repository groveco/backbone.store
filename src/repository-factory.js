import {HttpAdapter} from './http-adapter'
import {JsonApiParser} from './json-api-parser'
import {Repository} from './repository'

let repositoryFactory = (modelClass, url) => {
  let parser = new JsonApiParser();
  let adapter = new HttpAdapter(url, parser);
  return new Repository(modelClass, adapter);
};

export {repositoryFactory};