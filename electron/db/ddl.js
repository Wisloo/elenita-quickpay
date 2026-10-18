export function runDdl(sqlite) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'cashier' CHECK (role IN ('admin', 'cashier')),
      active INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_number TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      meter_number TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      per_cubic_meter_cents INTEGER NOT NULL,
      fixed_fee_cents INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 0,
      effective_from TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL REFERENCES customers(id),
      reading_date TEXT NOT NULL,
      previous_reading REAL NOT NULL,
      current_reading REAL NOT NULL,
      consumption REAL NOT NULL,
      rate_id INTEGER REFERENCES rates(id),
      amount_cents INTEGER NOT NULL,
      notes TEXT,
      user_id INTEGER REFERENCES users(id),
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bill_number TEXT NOT NULL UNIQUE,
      customer_id INTEGER NOT NULL REFERENCES customers(id),
      reading_id INTEGER REFERENCES readings(id),
      period TEXT,
      amount_due_cents INTEGER NOT NULL,
      paid_cents INTEGER NOT NULL DEFAULT 0,
      due_date TEXT,
      status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partial', 'paid', 'void')),
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receipt_number TEXT NOT NULL UNIQUE,
      bill_id INTEGER NOT NULL REFERENCES bills(id),
      customer_id INTEGER NOT NULL REFERENCES customers(id),
      amount_cents INTEGER NOT NULL,
      method TEXT NOT NULL CHECK (method IN ('cash', 'gcash')),
      reference TEXT,
      user_id INTEGER REFERENCES users(id),
      paid_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_bills_customer ON bills(customer_id);
    CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
    CREATE INDEX IF NOT EXISTS idx_payments_bill ON payments(bill_id);
    CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON payments(paid_at);
    CREATE INDEX IF NOT EXISTS idx_readings_customer ON readings(customer_id);
  `)
}
