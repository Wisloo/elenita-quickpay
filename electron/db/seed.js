import { eq } from 'drizzle-orm'
import { hashSync } from 'bcryptjs'
import { users, rates, settings } from './schema.js'

const DEFAULT_SETTINGS = {
  storeName: 'Elenita Heights Water Billing',
  storeAddress: '',
  storeContact: '',
  receiptFooter: 'Thank you! Keep this receipt for your records.',
  billSeq: '0',
  receiptSeq: '0'
}

export function seed(db) {
  const existingUsers = db.select().from(users).limit(1).all()
  if (existingUsers.length === 0) {
    db.insert(users)
      .values({
        username: 'admin',
        passwordHash: hashSync('admin', 10),
        fullName: 'Administrator',
        role: 'admin',
        active: true
      })
      .run()
  }

  const existingRates = db.select().from(rates).limit(1).all()
  if (existingRates.length === 0) {
    db.insert(rates)
      .values({
        name: 'Domestic Rate',
        perCubicMeterCents: 5000,
        fixedFeeCents: 0,
        active: true,
        effectiveFrom: new Date().toISOString().slice(0, 10)
      })
      .run()
  }

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    const found = db.select().from(settings).where(eq(settings.key, key)).get()
    if (!found) {
      db.insert(settings).values({ key, value }).run()
    }
  }
}
