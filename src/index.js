import {HttpAdapter} from './http-adapter'
import {JsonApiParser} from './json-api-parser'
import {Repository} from './repository'
import {Store} from './store'

let BackboneStore = {
  HttpAdapter,
  JsonApiParser,
  Repository,
  Store
};

export default BackboneStore