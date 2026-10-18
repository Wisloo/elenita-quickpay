import { app } from 'electron'
import { mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { eq } from 'drizzle-orm'
import * as schema from './schema.js'
import { runDdl } from './ddl.js'
import { seed } from './seed.js'

let sqlite = null
let db = null

export function dbPath() {
  return join(app.getPath('userData'), 'quickpay.db')
}

export function initDb() {
  const file = dbPath()
  mkdirSync(dirname(file), { recursive: true })
  sqlite = new Database(file)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')
  runDdl(sqlite)
  db = drizzle(sqlite, { schema })
  seed(db)
  return db
}

export function getDb() {
  if (!db) throw new Error('Database not initialized')
  return db
}

export function getSqlite() {
  if (!sqlite) throw new Error('Database not initialized')
  return sqlite
}

export function closeDb() {
  try {
    sqlite?.close()
  } catch {
    /* already closed */
  }
  sqlite = null
  db = null
}

export function nextSequence(key) {
  const row = getDb().select().from(schema.settings).where(eq(schema.settings.key, key)).get()
  const next = (parseInt(row?.value ?? '0', 10) || 0) + 1
  getDb()
    .insert(schema.settings)
    .values({ key, value: String(next) })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value: String(next) } })
    .run()
  return next
}

export function formatNumbered(prefix, seq) {
  return `${prefix}-${String(seq).padStart(5, '0')}`
}

export { schema }
