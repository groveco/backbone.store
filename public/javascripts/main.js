import {factory} from './repository-factory'
import {factory as storeFact} from './store-factory'
import {User} from './models/user'
import {Pantry} from './models/pantry'
import {Shipment} from './models/shipment'

let store = storeFact.getStore();
let userRepository = factory('user', User, '/api/user/');
let pantryRepository = factory('pantry', Pantry, '/api/pantry/');
let shipmentRepository = factory('shipment', Shipment, '/api/shipment/');

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