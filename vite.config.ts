import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

// markdown2view 构建配置
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'markdown2view — Markdown 多场景渲染工作台',
        short_name: 'markdown2view',
        description: '纯前端 Markdown / HTML 多场景渲染与导出工作台',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        lang: 'zh-CN',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/workbox-/],
        // 分层缓存：预缓存仅含应用外壳，JS 大块走运行时缓存
        globPatterns: ['**/*.{css,html,svg,png,woff2}'],
        globIgnores: ['assets/*.js'],
        runtimeCaching: [
          {
            // 主入口 + 懒加载 chunk：首次访问后缓存，离线可复用
            urlPattern: /\/assets\/.+\.js$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'app-chunks',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            // CDN 资源（MathJax 等）：版本化 URL，优先用缓存
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      // @ 指向 src（应用代码），@engine 指向移植自 r-markdown 的框架无关渲染引擎
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@engine': fileURLToPath(new URL('./src/engine', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'codemirror-vendor': [
            '@codemirror/language',
            '@codemirror/lang-markdown',
            '@codemirror/lang-html',
            '@uiw/react-codemirror',
            'codemirror'
          ],
          'engine-vendor': ['highlight.js', 'katex'],
          'mermaid-vendor': ['mermaid'],
          'mathjax-vendor': ['mathjax'],
        }
      }
    }
  },
  esbuild: {
    pure: ['console.log'],
    drop: ['debugger']
  }
})
