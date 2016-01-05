import {factory} from './repository-factory'
import {Store} from './store'
import {User} from './models/user'
import {Pantry} from './models/pantry'
import {Shipment} from './models/shipment'

let store = new Store();
let userRepository = factory(User, '/api/user/');
let pantryRepository = factory(Pantry, '/api/pantry/');
let shipmentRepository = factory(Shipment, '/api/shipment/');

store.register(userRepository);
store.register(pantryRepository);
store.register(shipmentRepository);

let repo = store.getRepository(User);
let deferred = repo.getById(12);
deferred.then(model => {
  console.log(model);
});

let foo = 'foo';

export {foo};