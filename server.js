import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import checkoutHandler from './api/checkout.js';
import statusHandler from './api/status.js';
import webhookHandler from './api/webhooks/sigilopay.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega .env.local se existir
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

const PORT = process.env.PORT || 3001;

const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  const pathname = urlObj.pathname;

  // Helper de resposta compatível com Vercel handler
  const mockRes = {
    statusCode: 200,
    setHeader: (k, v) => res.setHeader(k, v),
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      res.writeHead(this.statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    },
    end(data) {
      res.writeHead(this.statusCode);
      res.end(data);
    }
  };

  // Extrai body se POST
  let bodyData = null;
  if (req.method === 'POST') {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString();
    try {
      bodyData = JSON.parse(raw);
    } catch {
      bodyData = raw;
    }
  }

  const mockReq = {
    method: req.method,
    headers: req.headers,
    query: Object.fromEntries(urlObj.searchParams),
    body: bodyData,
    url: req.url,
  };

  if (pathname === '/api/checkout') {
    return checkoutHandler(mockReq, mockRes);
  } else if (pathname === '/api/status') {
    return statusHandler(mockReq, mockRes);
  } else if (pathname === '/api/webhooks/sigilopay') {
    return webhookHandler(mockReq, mockRes);
  }

  // Se não for API, tenta servir estáticos da pasta dist/
  const distPath = path.join(__dirname, 'dist');
  let filePath = path.join(distPath, pathname === '/' ? 'index.html' : pathname);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.webp': 'image/webp',
    };
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else if (fs.existsSync(path.join(distPath, 'index.html'))) {
    // SPA fallback
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(path.join(distPath, 'index.html')).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Backend Server rodando na porta ${PORT}`);
});
