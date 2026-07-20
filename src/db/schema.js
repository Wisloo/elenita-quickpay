import { pgTable, serial, varchar, numeric, timestamp } from 'drizzle-orm/pg-core'

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  accountNumber: varchar('account_number', { length: 255 }).notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  reference: varchar('reference', { length: 255 }).notNull(),
  receipt: varchar('receipt', { length: 1000 }),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
})

export const contactMessages = pgTable('contact_messages', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  message: varchar('message', { length: 2000 }).notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
})
