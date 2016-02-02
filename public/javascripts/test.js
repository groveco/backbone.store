var repositoryFactory = (modelClass, url) => {
  let parser = new JsonApiParser();
  let adapter = new HttpAdapter(url, parser);
  return new Repository(modelClass, adapter);
};

let store = Store.instance();
let userRepository = repositoryFactory(User, '/api/user/');
let pantryRepository = repositoryFactory(Pantry, '/api/pantry/');
let shipmentRepository = repositoryFactory(Shipment, '/api/shipment/');

store.register('user', userRepository);
store.register('pantry', pantryRepository);
store.register('shipment', shipmentRepository);

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