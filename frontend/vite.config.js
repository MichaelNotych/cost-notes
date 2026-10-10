import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import tailwindcss from '@tailwindcss/vite'

import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss(), VitePWA({
    registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'CostNotes',
        short_name: 'CN',
        description: 'Minimalistic expense tracker powered with AI',
        theme_color: '#27272a',
        background_color: '#27272a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
  })],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'https://costnotes-api.notych.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  preview: {
    port: 3000,
    host: true,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
