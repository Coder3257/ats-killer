import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import 'dotenv/config';
import analyzeHandler from './api/analyze';
import chatHandler from './api/chat';
import jobMatchHandler from './api/job-match';
import rewriteHandler from './api/rewrite';
import gamificationHandler from './api/gamification';
import testSentryHandler from './api/test-sentry';

import testAnalyzeHandler from './api/test-analyze';
import fixSuggestionHandler from './api/fix-suggestion';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'api-router',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const url = req.url;
            if (url && url.startsWith('/api/')) {
              let handler: any = null;
              if (url === '/api/analyze' && req.method === 'POST') handler = analyzeHandler;
              else if (url === '/api/chat' && req.method === 'POST') handler = chatHandler;
              else if (url === '/api/job-match' && req.method === 'POST') handler = jobMatchHandler;
              else if (url === '/api/rewrite' && req.method === 'POST') handler = rewriteHandler;
              else if (url === '/api/gamification') handler = gamificationHandler;
              else if (url === '/api/test-sentry') handler = testSentryHandler;

              else if (url === '/api/test-analyze' && req.method === 'POST') handler = testAnalyzeHandler;
              else if (url === '/api/fix-suggestion' && req.method === 'POST') handler = fixSuggestionHandler;

              if (handler) {
                let body = '';
                req.on('data', (chunk) => { body += chunk; });
                req.on('end', async () => {
                  try {
                    const parsedBody = body ? JSON.parse(body) : {};
                    const mockReq = req as any;
                    mockReq.body = parsedBody;

                    const mockRes = res as any;
                    mockRes.status = function (code: number) {
                      res.statusCode = code;
                      return this;
                    };
                    mockRes.json = function (data: any) {
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify(data));
                      return this;
                    };

                    await handler(mockReq, mockRes);
                  } catch (err: any) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: err.message || 'Error occurred' }));
                  }
                });
                return;
              }
            }
            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    define: {
      'process.env.VITE_SENTRY_DSN': JSON.stringify(process.env.VITE_SENTRY_DSN),
      'import.meta.env.VITE_SENTRY_DSN': JSON.stringify(process.env.VITE_SENTRY_DSN),
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // Leave the file-parsing libs alone so Rollup can keep them in the
              // dynamic-import chunks created by src/features/analyzer/parseFile.ts.
              // Returning 'vendor' here would pull them into the eager bundle.
              if (id.includes('pdfjs-dist') || id.includes('mammoth')) return;
              // Split lucide-react and framer-motion into separate chunks
              if (id.includes('lucide-react')) return 'lucide-react';
              if (id.includes('framer-motion')) return 'framer-motion';
              // Optionally vendor chunk
              return 'vendor';
            }
          }
        }
      }
    }
  };
});
// Trigger dev server reload to import the updated API handlers


