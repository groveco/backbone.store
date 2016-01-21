import {HttpAdapter} from './http-adapter'
import {JsonApiParser} from './json-api-parser'
import {Repository} from './repository'

let repositoryFactory = (modelName, modelClass, url) => {
  let parser = new JsonApiParser();
  let adapter = new HttpAdapter(url, parser);
  return new Repository(modelName, modelClass, adapter);
};

export {repositoryFactory};