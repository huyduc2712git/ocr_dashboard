import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './api/index';

let __dirname_var = process.cwd();
try {
  if (typeof import.meta !== 'undefined' && import.meta.url) {
    __dirname_var = path.dirname(fileURLToPath(import.meta.url));
  } else if (typeof __dirname !== 'undefined') {
    __dirname_var = __dirname;
  }
} catch {
  __dirname_var = process.cwd();
}

const PORT = Number(process.env.PORT) || 3001;

// App initialization for local development
async function startServer() {
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname_var, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  let currentPort = PORT;
  const server = app.listen(currentPort, '0.0.0.0', () => {
    console.log(`Server OCR Dashboard running on http://localhost:${currentPort}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      currentPort += 1;
      console.log(`Port ${currentPort - 1} busy, trying http://localhost:${currentPort}...`);
      server.listen(currentPort, '0.0.0.0');
    } else {
      console.error('Server error:', err);
    }
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
