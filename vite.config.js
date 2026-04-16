import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Allow JSX in `.js` files so components/pages can be named `*.js` as requested.
  plugins: [
    react({
      include: [/\.[jt]sx?$/],
    }),
    tailwindcss(),
  ],
  esbuild: {
    jsx: 'automatic',
  },
})
