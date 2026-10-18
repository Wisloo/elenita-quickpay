import { app } from 'electron'

export function relaunch() {
  app.relaunch()
  app.exit(0)
  return { ok: true }
}
