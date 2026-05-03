import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      // 将所有以 /api 开头的请求代理到后端服务器
      '/api': {
        target: 'http://localhost:8080', // 后端服务地址
        changeOrigin: true,
        // 不需要 rewrite，因为后端本身就有 /medical 前缀
        // 前端请求: /api/medical/consult -> 后端接收: /api/medical/consult
        // 但后端实际路径是 /medical/consult，所以需要去掉 /api 前缀
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
