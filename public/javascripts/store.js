class Store {
  constructor() {
    this._repositories = new Map();
  }

  register(repository) {
    this._repositories.set(repository.modelClass, repository);
  }

  getRepository(modelClass) {
    return this._repositories.get(modelClass);
  }
}

export {Store};