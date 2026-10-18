import { z } from 'zod'
import { app, dialog } from 'electron'
import { copyFileSync, existsSync, statSync } from 'node:fs'
import { closeDb, dbPath, getSqlite, initDb } from '../db/index.js'
import { requireAdmin } from './helpers.js'

export function create(arg) {
  requireAdmin(arg?.actorId)
  const sqlite = getSqlite()
  sqlite.pragma('wal_checkpoint(TRUNCATE)')
  const date = new Date().toISOString().slice(0, 10)
  const target = dialog.showSaveDialogSync({
    title: 'Backup database',
    defaultPath: `quickpay-backup-${date}.db`,
    filters: [{ name: 'SQLite database', extensions: ['db'] }]
  })
  if (!target) return { canceled: true }
  copyFileSync(dbPath(), target)
  return { canceled: false, path: target }
}

export function pickFile(arg) {
  requireAdmin(arg?.actorId)
  const { canceled, filePaths } = dialog.showOpenDialogSync({
    title: 'Select backup file',
    filters: [{ name: 'SQLite database', extensions: ['db'] }],
    properties: ['openFile']
  })
  if (canceled || !filePaths?.length) return { canceled: true }
  const path = filePaths[0]
  if (!existsSync(path)) throw new Error('Selected file does not exist')
  if (statSync(path).size < 4096) throw new Error('Selected file is not a valid backup')
  return { canceled: false, path }
}

export function restoreFrom(arg) {
  const data = z
    .object({
      actorId: z.number().int().positive(),
      path: z.string().min(1)
    })
    .parse(arg)
  requireAdmin(data.actorId)
  if (!existsSync(data.path)) throw new Error('Backup file no longer exists')
  if (statSync(data.path).size < 4096) throw new Error('Backup file is not a valid database')
  closeDb()
  copyFileSync(data.path, dbPath())
  initDb()
  app.relaunch()
  app.exit(0)
  return { restored: true }
}
