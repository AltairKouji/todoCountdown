import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// 根据环境自动设置 base 路径
// Vercel: 根路径 '/'
// GitHub Pages: 子路径 '/todoCountdown/'
const base = process.env.GITHUB_ACTIONS ? '/todoCountdown/' : (process.env.VERCEL ? '/' : '/todoCountdown/');

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      base,  // 重要：PWA 插件需要知道 base 路径
      registerType: 'prompt',
      devOptions: { enabled: true },
      workbox: {
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3MB
      },
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
