import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      lib: {
        entry: resolve('electron/main.js')
      }
    },
    resolve: {
      alias: { '@': resolve('electron') }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      lib: {
        entry: resolve('electron/preload.js')
      }
    },
    resolve: {
      alias: { '@': resolve('electron') }
    }
  },
  renderer: {
    root: resolve('.'),
    resolve: {
      alias: { '@': resolve('src') }
    },
    build: {
      rollupOptions: {
        input: resolve('index.html')
      }
    },
    plugins: [react(), tailwindcss()]
  }
})
