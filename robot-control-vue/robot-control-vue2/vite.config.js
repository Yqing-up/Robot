import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      // 代理所有 /api 开头的请求到后端服务器
      '/api': {
        target: 'http://192.168.0.103:5001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('代理错误:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('代理请求 -> 目标服务器:', req.method, req.url, '->', 'http://192.168.0.103:5001' + req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('代理响应 <- 目标服务器:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  }
})
