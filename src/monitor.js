const EVENT_ACCESS = 'access'
const EVENT_ADD = 'add'

export default class Monitor {
  constructor() {
    this.counters = {
      [EVENT_ADD]: {},
      [EVENT_ACCESS]: {}
    }
  }

  install() {
    window.$BB_STORE_MONITOR = this
  }

  initAttr(val) {
    if (!this.counters[EVENT_ADD].hasOwnProperty(val)) {
      this.counters[EVENT_ADD][val] = 0
      this.counters[EVENT_ACCESS][val] = 0
    }
  }

  [EVENT_ADD](val) {
    this.initAttr(val)
    this.counters[EVENT_ADD][val] += 1
  }

  [EVENT_ACCESS](val) {
    this.initAttr(val)
    this.counters[EVENT_ACCESS][val] += 1
  }

  stats() {
    return {
      [EVENT_ADD]: Object.keys(this.counters[EVENT_ADD]).length,
      [EVENT_ACCESS]: Object.keys(this.counters[EVENT_ACCESS]).length
    }
  }
}
