# Elenita QuickPay POS

Desktop point-of-sale for **Elenita Heights water billing** — record meter readings, issue bills, collect cash/GCash payments, print receipts, and run end-of-day Z-reports. Windows-only Electron app with a fully local SQLite database (no internet or server required).

Built with Electron + Vite + React + Tailwind CSS v4 + Drizzle ORM (better-sqlite3).

## Features

- **Cashier login** — local accounts with admin/cashier roles (default `admin` / `admin`)
- **Customer accounts** — account numbers, meters, addresses, full billing history
- **Meter readings** — previous-reading validation, consumption from the active rate table
- **Billing** — auto bills from readings or manual bills; partial payments supported
- **Payments** — cash or GCash (with reference number), receipt numbering `R2026-00001`
- **Receipt printing** — 80mm-receipt-friendly print layout
- **Z-Report** — daily totals, method split, per-cashier breakdown, printable
- **Rates management** — multiple rates, one active rate used for new readings
- **Backup / restore** — save and restore the database file via dialog

## Development

```bash
npm install
npm run dev        # electron-vite dev with hot reload
```

## Build & package (Windows)

```bash
npm run dist       # build + NSIS installer into release/
npm run dist:dir   # build + unpacked app folder (no installer)
```

The installer is written to `release/QuickPayPOS-<version>-setup.exe`.

## Data location

The database (`quickpay.db`) lives in the app's user data folder:

```
%APPDATA%/Elenita QuickPay POS/quickpay.db
```

Back it up regularly from **Settings → Backup & Data**.

## Default login

| Username | Password | Role  |
| -------- | -------- | ----- |
| `admin`  | `admin`  | admin |

Change the password immediately after first sign-in (**Settings → My Account**), and add your cashiers under **Settings → Users**.

## Design

UI follows the *Construtivismo de Dados Dinâmicos* system: Roboto Mono throughout, deep blue `#005691` with aqua/orange/purple accents, dense structured layouts, subtle motion.
