import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { searchConsoleTags } from './src/config/searchConsole'

export default defineConfig(({ mode }) => ({
  plugins: [react(), {
    name: 'search-console-verification',
    transformIndexHtml() {
      const env = loadEnv(mode, '.', 'VITE_')
      return searchConsoleTags(env.VITE_GSC_VERIFICATION_TOKEN)
    },
  }],
  base: '/AIDOGE.AI_web/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const path = id.replaceAll('\\', '/')
          const marker = '/node_modules/'
          const index = path.lastIndexOf(marker)
          if (index === -1) return
          const parts = path.slice(index + marker.length).split('/')
          const name = parts[0].startsWith('@') ? parts.slice(0, 2).join('/') : parts[0]
          if (['react', 'react-dom', 'scheduler'].includes(name)) return 'vendor-react'
          if (['@tanstack/react-query', '@tanstack/query-core'].includes(name)) return 'vendor-query'
          if (['viem', 'wagmi', 'ox', 'abitype'].includes(name) || name.startsWith('@wagmi/') || name.startsWith('@noble/')) return 'vendor-web3'
        },
      },
    },
  },
}))
