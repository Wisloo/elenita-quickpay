import { contextBridge, ipcRenderer } from 'electron'

const invoke = (channel) => (payload) => ipcRenderer.invoke(channel, payload)

contextBridge.exposeInMainWorld('pos', {
  auth: {
    login: invoke('auth:login'),
    changePassword: invoke('auth:changePassword')
  },
  users: {
    list: invoke('users:list'),
    create: invoke('users:create'),
    update: invoke('users:update'),
    toggleActive: invoke('users:toggleActive'),
    resetPassword: invoke('users:resetPassword')
  },
  customers: {
    list: invoke('customers:list'),
    get: invoke('customers:get'),
    create: invoke('customers:create'),
    update: invoke('customers:update'),
    deactivate: invoke('customers:deactivate'),
    statement: invoke('customers:statement')
  },
  rates: {
    list: invoke('rates:list'),
    create: invoke('rates:create'),
    update: invoke('rates:update'),
    setActive: invoke('rates:setActive')
  },
  readings: {
    list: invoke('readings:list'),
    create: invoke('readings:create')
  },
  bills: {
    list: invoke('bills:list'),
    create: invoke('bills:create'),
    voidBill: invoke('bills:void')
  },
  payments: {
    record: invoke('payments:record'),
    get: invoke('payments:get'),
    list: invoke('payments:list')
  },
  reports: {
    daily: invoke('reports:daily'),
    range: invoke('reports:range')
  },
  settings: {
    get: invoke('settings:get'),
    set: invoke('settings:set')
  },
  backup: {
    create: invoke('backup:create'),
    pickFile: invoke('backup:pickFile'),
    restoreFrom: invoke('backup:restoreFrom')
  },
  app: {
    relaunch: invoke('app:relaunch')
  }
})
