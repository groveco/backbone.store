import Model from './internal-model'

const EVENT_ACCESS = 'access'
const EVENT_ADD = 'add'

export class Monitor extends EventTarget {
  constructor() {
    super()
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

    const evt = new Event(EVENT_ADD)
    evt.value = val
    this.dispatchEvent(evt)
  }

  [EVENT_ACCESS](val) {
    this.initAttr(val)
    this.counters[EVENT_ACCESS][val] += 1

    const evt = new Event(EVENT_ACCESS)
    evt.value = val
    this.dispatchEvent(evt)
  }

  stats() {
    return {
      [EVENT_ADD]: Object.keys(this.counters[EVENT_ADD]).length,
      [EVENT_ACCESS]: Object.keys(this.counters[EVENT_ACCESS]).length
    }
  }
}

export function ModelMonitor(monitor) {
  return {
    constructor() {
      Model.apply(this, arguments);
      Object.keys(this.attributes).forEach((attr) => monitor[EVENT_ADD](`${this.attributes._type}-${this.id}#${attr}`))
    },

    get(attr) {
      if (attr in this.attributes) {
        monitor[EVENT_ACCESS](`${this.attributes._type}-${this.id}#${attr}`)
      }

      return Model.prototype.get.apply(this, arguments)
    }
  }
}