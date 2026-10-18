import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name').notNull(),
  role: text('role').$type('admin' | 'cashier').notNull().default('cashier'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date())
})

export const customers = sqliteTable('customers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  accountNumber: text('account_number').notNull().unique(),
  name: text('name').notNull(),
  address: text('address'),
  phone: text('phone'),
  meterNumber: text('meter_number'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date())
})

export const rates = sqliteTable('rates', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  perCubicMeterCents: integer('per_cubic_meter_cents').notNull(),
  fixedFeeCents: integer('fixed_fee_cents').notNull().default(0),
  active: integer('active', { mode: 'boolean' }).notNull().default(false),
  effectiveFrom: text('effective_from'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date())
})

export const readings = sqliteTable('readings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  customerId: integer('customer_id')
    .notNull()
    .references(() => customers.id),
  readingDate: text('reading_date').notNull(),
  previousReading: real('previous_reading').notNull(),
  currentReading: real('current_reading').notNull(),
  consumption: real('consumption').notNull(),
  rateId: integer('rate_id').references(() => rates.id),
  amountCents: integer('amount_cents').notNull(),
  notes: text('notes'),
  userId: integer('user_id').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date())
})

export const bills = sqliteTable('bills', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  billNumber: text('bill_number').notNull().unique(),
  customerId: integer('customer_id')
    .notNull()
    .references(() => customers.id),
  readingId: integer('reading_id').references(() => readings.id),
  period: text('period'),
  amountDueCents: integer('amount_due_cents').notNull(),
  paidCents: integer('paid_cents').notNull().default(0),
  dueDate: text('due_date'),
  status: text('status').$type('unpaid' | 'partial' | 'paid' | 'void').notNull().default('unpaid'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date())
})

export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  receiptNumber: text('receipt_number').notNull().unique(),
  billId: integer('bill_id')
    .notNull()
    .references(() => bills.id),
  customerId: integer('customer_id')
    .notNull()
    .references(() => customers.id),
  amountCents: integer('amount_cents').notNull(),
  method: text('method').$type('cash' | 'gcash').notNull(),
  reference: text('reference'),
  userId: integer('user_id').references(() => users.id),
  paidAt: integer('paid_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date())
})

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value')
})
