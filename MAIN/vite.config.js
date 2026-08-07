import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'fs'
import { resolve } from 'path'

function localApiPlugin() {
  return {
    name: 'local-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url.startsWith('/api/')) {
          const url = new URL(req.url, `http://${req.headers.host}`)
          const apiName = url.pathname.slice(5) // Remove '/api/'

          try {
            const modulePath = resolve(process.cwd(), `./api/${apiName}.js`)
            const { pathToFileURL } = await import('url')
            const handlerModule = await import(pathToFileURL(modulePath).href)
            const handler = handlerModule.default

            // Parse body if POST
            let body = {}
            if (req.method === 'POST') {
              body = await new Promise((resolveBody) => {
                let data = ''
                req.on('data', chunk => {
                  data += chunk
                })
                req.on('end', () => {
                  try {
                    resolveBody(JSON.parse(data))
                  } catch {
                    resolveBody({})
                  }
                })
              })
            }

            // Create Vercel-like res object
            const vercelRes = {
              status(code) {
                res.statusCode = code
                return this
              },
              json(data) {
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify(data))
                return this
              },
              setHeader(name, value) {
                res.setHeader(name, value)
                return this
              },
              end(data) {
                res.end(data)
                return this
              }
            }

            // Create Vercel-like req object
            const vercelReq = {
              method: req.method,
              headers: req.headers,
              body,
              query: Object.fromEntries(url.searchParams)
            }

            await handler(vercelReq, vercelRes)
          } catch (err) {
            console.error('Local API emulation handler error:', err)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Local API emulation failed', details: err.message }))
          }
        } else {
          next()
        }
      })
    }
  }
}

export default defineConfig(({ mode }) => {
  // Load env variables manually into process.env so that local api middleware has access to them
  const env = loadEnv(mode, process.cwd(), '')
  process.env.GEMINI_API_KEY = env.GEMINI_API_KEY

  // Direct file parsing fallback for .env.local to ensure non-prefixed variables are loaded
  if (!process.env.GEMINI_API_KEY) {
    try {
      const envPath = resolve(process.cwd(), '.env.local')
      const envContent = readFileSync(envPath, 'utf-8')
      envContent.split('\n').forEach(line => {
        const parts = line.split('=')
        if (parts.length >= 2) {
          const key = parts[0].trim()
          const val = parts.slice(1).join('=').trim()
          if (key === 'GEMINI_API_KEY') {
            process.env.GEMINI_API_KEY = val
          }
        }
      })
    } catch (e) {
      console.warn('Failed to parse .env.local for process.env:', e.message)
    }
  }

  return {
    plugins: [react(), tailwindcss(), localApiPlugin()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('firebase')) {
                return 'vendor-firebase'
              }
              if (id.includes('framer-motion')) {
                return 'vendor-framer'
              }
              if (id.includes('lucide-react')) {
                return 'vendor-lucide'
              }
              return 'vendor-core'
            }
          }
        }
      }
    }
  }
})
//just to test
