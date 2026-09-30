import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function serveLogoPlugin(): Plugin {
  const logoDir = path.resolve(__dirname, '../logo')
  return {
    name: 'serve-logo',
    configureServer(server) {
      server.middlewares.use('/logo', (req, res, next) => {
        const reqPath = (req.url || '').split('?')[0]
        const filePath = path.join(logoDir, reqPath)
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          res.setHeader('Content-Type', 'image/png')
          res.setHeader('Cache-Control', 'public, max-age=3600')
          return fs.createReadStream(filePath).pipe(res)
        }
        next()
      })
    },
    closeBundle() {
      const outDir = path.resolve(__dirname, 'dist/logo')
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true })
      }
      if (fs.existsSync(logoDir)) {
        const files = fs.readdirSync(logoDir)
        for (const file of files) {
          const srcFile = path.join(logoDir, file)
          if (fs.statSync(srcFile).isFile() && !file.startsWith('.')) {
            fs.copyFileSync(srcFile, path.join(outDir, file))
          }
        }
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), serveLogoPlugin()],
  optimizeDeps: {
    exclude: ['maplibre-gl', '@maplibre/maplibre-gl-leaflet'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
