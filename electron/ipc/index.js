import { ipcMain } from 'electron'
import * as auth from './auth.js'
import * as users from './users.js'
import * as customers from './customers.js'
import * as rates from './rates.js'
import * as readings from './readings.js'
import * as bills from './bills.js'
import * as payments from './payments.js'
import * as reports from './reports.js'
import * as settings from './settings.js'
import * as backup from './backup.js'
import * as appIpc from './app.js'

const handlers = {
  'auth:login': auth.login,
  'auth:changePassword': auth.changePassword,
  'users:list': users.list,
  'users:create': users.create,
  'users:update': users.update,
  'users:toggleActive': users.toggleActive,
  'users:resetPassword': users.resetPassword,
  'customers:list': customers.list,
  'customers:get': customers.get,
  'customers:create': customers.create,
  'customers:update': customers.update,
  'customers:deactivate': customers.deactivate,
  'customers:statement': customers.statement,
  'rates:list': rates.list,
  'rates:create': rates.create,
  'rates:update': rates.update,
  'rates:setActive': rates.setActive,
  'readings:list': readings.list,
  'readings:create': readings.create,
  'bills:list': bills.list,
  'bills:create': bills.create,
  'bills:void': bills.voidBill,
  'payments:record': payments.record,
  'payments:get': payments.get,
  'payments:list': payments.list,
  'reports:daily': reports.daily,
  'reports:range': reports.range,
  'settings:get': settings.get,
  'settings:set': settings.set,
  'backup:create': backup.create,
  'backup:pickFile': backup.pickFile,
  'backup:restoreFrom': backup.restoreFrom,
  'app:relaunch': appIpc.relaunch
}

export function registerIpc() {
  for (const [channel, fn] of Object.entries(handlers)) {
    ipcMain.handle(channel, async (_event, arg) => {
      try {
        return { ok: true, data: await fn(arg) }
      } catch (err) {
        return { ok: false, error: err?.message || String(err) }
      }
    })
  }
}
