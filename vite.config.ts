import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/todoCountdown/',   // GitHub Pages 子路径
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      manifest: {
        name: '清爽待办与倒数日',
        short_name: '待办倒数日',
        start_url: '.',   // 用相对路径，避免根路径问题
        scope: '.',       // 限制在子目录作用域
        theme_color: '#0ea5e9',
        background_color: '#ffffff',
        display: 'standalone',
        // icons 的 src 别以 / 开头（保持相对路径）
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
})
