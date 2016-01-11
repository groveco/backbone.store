class Store {
  constructor() {
    this._repositories = new Map();
  }

  register(repository) {
    this._repositories.set(repository.modelName, repository);
  }

  getRepository(modelName) {
    return this._repositories.get(modelName);
  }
}

export {Store};