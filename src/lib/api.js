const bridge = typeof window !== 'undefined' ? window.pos : undefined

async function call(fn, ...args) {
  if (!bridge) throw new Error('POS bridge unavailable')
  const res = await fn(...args)
  if (!res?.ok) throw new Error(res?.error || 'Unknown error')
  return res.data
}

export const api = {
  auth: {
    login: (data) => call(bridge.auth.login, data),
    changePassword: (data) => call(bridge.auth.changePassword, data)
  },
  users: {
    list: (data) => call(bridge.users.list, data),
    create: (data) => call(bridge.users.create, data),
    update: (data) => call(bridge.users.update, data),
    toggleActive: (data) => call(bridge.users.toggleActive, data),
    resetPassword: (data) => call(bridge.users.resetPassword, data)
  },
  customers: {
    list: (data) => call(bridge.customers.list, data),
    get: (id) => call(bridge.customers.get, id),
    create: (data) => call(bridge.customers.create, data),
    update: (data) => call(bridge.customers.update, data),
    deactivate: (data) => call(bridge.customers.deactivate, data),
    statement: (id) => call(bridge.customers.statement, id)
  },
  rates: {
    list: (data) => call(bridge.rates.list, data),
    create: (data) => call(bridge.rates.create, data),
    update: (data) => call(bridge.rates.update, data),
    setActive: (data) => call(bridge.rates.setActive, data)
  },
  readings: {
    list: (data) => call(bridge.readings.list, data),
    create: (data) => call(bridge.readings.create, data)
  },
  bills: {
    list: (data) => call(bridge.bills.list, data),
    create: (data) => call(bridge.bills.create, data),
    voidBill: (data) => call(bridge.bills.voidBill, data)
  },
  payments: {
    record: (data) => call(bridge.payments.record, data),
    get: (id) => call(bridge.payments.get, id),
    list: (data) => call(bridge.payments.list, data)
  },
  reports: {
    daily: (data) => call(bridge.reports.daily, data),
    range: (data) => call(bridge.reports.range, data)
  },
  settings: {
    get: (actorId) => call(bridge.settings.get, actorId),
    set: (data) => call(bridge.settings.set, data)
  },
  backup: {
    create: (data) => call(bridge.backup.create, data),
    pickFile: (data) => call(bridge.backup.pickFile, data),
    restoreFrom: (data) => call(bridge.backup.restoreFrom, data)
  },
  app: {
    relaunch: () => call(bridge.app.relaunch)
  }
}

export default api
