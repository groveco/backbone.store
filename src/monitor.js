const EVENT_ACCESS = 'access'
const EVENT_ADD = 'add'

export default class Monitor {
  constructor() {
    this._log = []
  }

  install() {
    window.$BB_STORE_MONITOR = this
  }

  add(val) {
    this._evt(EVENT_ADD, val)
  }

  access(val) {
    this._evt(EVENT_ACCESS, val)
  }

  _evt(event, val) {
    this._log.push({ event, val })
  }

  state() {
    return this._log.reduce((res, {event, val}) => {
      res[event].add(val)
      return res
    }, {
      [EVENT_ADD]: new Set(),
      [EVENT_ACCESS]: new Set()
    })
  }

  stats() {
    const state = this.state()

    return {
      [EVENT_ADD]: state[EVENT_ADD].size,
      [EVENT_ACCESS]: state[EVENT_ACCESS].size
    }
  }
}
