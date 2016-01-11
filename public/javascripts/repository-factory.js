import {JsonApiHttpAdapter} from './json-api-http-adapter'
import {Repository} from './repository'

let factory = (modelName, modelClass, url) => {
  let adapter = new JsonApiHttpAdapter(url);
  return new Repository(modelName, modelClass, adapter);
};

export {factory};