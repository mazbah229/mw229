import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    emptyOutDir: true,
    target: 'chrome51',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        dir: resolve(__dirname, '../iframe/'),
        entryFileNames: 'assets/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.includes('index.css')) {
            return 'assets/[name].[ext]'
          }
          return 'assets/[name].[hash].[ext]'
        },
        format: 'cjs',
      },
    },
  },
  server: { port: 5000 },
  base: '',
})
