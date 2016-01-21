import {repositoryFactory} from './repository-factory'
import {Store} from './store'
import {User} from './models/user'
import {Pantry} from './models/pantry'
import {Shipment} from './models/shipment'

let store = Store.instance();
let userRepository = repositoryFactory('user', User, '/api/user/');
let pantryRepository = repositoryFactory('pantry', Pantry, '/api/pantry/');
let shipmentRepository = repositoryFactory('shipment', Shipment, '/api/shipment/');

store.register(userRepository);
store.register(pantryRepository);
store.register(shipmentRepository);

let repo = store.getRepository('user');
let deferred = repo.getById(12);
deferred.then(model => {
  console.log('user ->');
  console.log(model);
  model.getAsync('pantry').then(pantry => {
    console.log('pantry ->');
    console.log(pantry);
  })
});