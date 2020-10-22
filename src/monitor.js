const EVENT_ACCESS = 'access'
const EVENT_ADD = 'add'

export default class Monitor {
  constructor() {
    this._log = []
    this.add_store = new Set()
    this.access_store = new Set()
    this.propCache = {}
  }

  install() {
    window.$BB_STORE_MONITOR = this
  }

  add(val) {
    this.add_store.add(val)
    if (this.propCache.hasOwnProperty(val)) {
      this.propCache[val] += 1
    } else {
      this.propCache[val] = 1
    }
  }

  access(val) {
    this.access_store.add(val)
  }

  stats() {
    return {
      [EVENT_ADD]: this.add_store.size,
      [EVENT_ACCESS]: this.access_store.size
    }
  }
}
