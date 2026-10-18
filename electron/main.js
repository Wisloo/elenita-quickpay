import { app, BrowserWindow, shell, dialog } from 'electron'
import { join } from 'node:path'
import { initDb, closeDb } from './db/index.js'
import { registerIpc } from './ipc/index.js'

let mainWindow = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    backgroundColor: '#ECF0F1',
    title: 'Elenita QuickPay POS',
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(import.meta.dirname, '../preload/preload.mjs'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.once('ready-to-show', () => mainWindow.show())

  // Safety net: never leave the window hidden if the renderer is slow or fails.
  mainWindow.webContents.on('did-finish-load', () => {
    if (mainWindow && !mainWindow.isVisible()) mainWindow.show()
  })
  mainWindow.webContents.on('did-fail-load', (_e, code, description, url) => {
    console.error(`[renderer] did-fail-load ${code} ${description} ${url}`)
    if (mainWindow && !mainWindow.isVisible()) mainWindow.show()
  })
  setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) mainWindow.show()
  }, 5000)

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(import.meta.dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  try {
    initDb()
    registerIpc()
  } catch (err) {
    console.error('[startup] failed:', err)
    dialog.showErrorBox(
      'Elenita QuickPay POS — Startup error',
      `${err?.stack || err?.message || String(err)}`
    )
    app.exit(1)
    return
  }

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    closeDb()
    app.quit()
  }
})
