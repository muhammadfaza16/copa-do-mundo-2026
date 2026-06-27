const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const ROOT_DIR = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Handle serverless APIs
  if (pathname === '/api/matches') {
    try {
      req.query = parsedUrl.query;
      const handlerModule = await import(url.pathToFileURL(path.join(ROOT_DIR, 'api', 'matches.js')).href);
      const handler = handlerModule.default;
      
      // Mock Vercel response API
      res.status = (code) => {
        res.statusCode = code;
        return res;
      };
      res.json = (data) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
        return res;
      };
      
      // Run the handler
      await handler(req, res);
    } catch (err) {
      console.error(err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (pathname === '/api/groups') {
    try {
      req.query = parsedUrl.query;
      const handlerModule = await import(url.pathToFileURL(path.join(ROOT_DIR, 'api', 'groups.js')).href);
      const handler = handlerModule.default;
      
      // Mock Vercel response API
      res.status = (code) => {
        res.statusCode = code;
        return res;
      };
      res.json = (data) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
        return res;
      };
      
      await handler(req, res);
    } catch (err) {
      console.error(err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (pathname === '/api/match-summary') {
    try {
      req.query = parsedUrl.query;
      const handlerModule = await import(url.pathToFileURL(path.join(ROOT_DIR, 'api', 'match-summary.js')).href);
      const handler = handlerModule.default;
      
      // Mock Vercel response API
      res.status = (code) => {
        res.statusCode = code;
        return res;
      };
      res.json = (data) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
        return res;
      };
      
      await handler(req, res);
    } catch (err) {
      console.error(err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // Handle static files
  let filePath = path.join(ROOT_DIR, pathname === '/' ? 'index.html' : pathname);
  
  // Guard against directory traversal
  if (!filePath.startsWith(ROOT_DIR)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.statusCode = 404;
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Local World Cup server running at http://localhost:${PORT}`);
});
