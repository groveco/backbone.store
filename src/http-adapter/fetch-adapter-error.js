export default class FetchAdapterError extends Error {
  constructor (message) {
    super(message)
    this.name = 'FetchAdapterError'
  }
}
