import pg from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema.js'

const { Pool } = pg

const connectionString = process.env.DATABASE_URL

if (!connectionString && typeof window === 'undefined') {
  console.warn('WARNING: DATABASE_URL environment variable is not set.')
}

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

let db
if (process.env.NODE_ENV === 'production') {
  db = drizzle(pool, { schema })
} else {
  if (!globalThis.globalDb) {
    globalThis.globalDb = drizzle(pool, { schema })
  }
  db = globalThis.globalDb
}

export { db }
