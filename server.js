const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');
const Database = require('better-sqlite3');

const PORT = process.env.PORT || 8080;

// Database setup
const dbPath = path.join(__dirname, 'bookings.db');
const db = new Database(dbPath);
db.prepare(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL
  )
`).run();

// Helper functions
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });
}

function serveStatic(res, filePath) {
  const fullPath = path.join(__dirname, 'public', filePath);
  
  if (!fs.existsSync(fullPath)) {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }

  const ext = path.extname(filePath);
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json'
  };

  res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
  fs.createReadStream(fullPath).pipe(res);
}

// Server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API Routes
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, pid: process.pid }));
    return;
  }

  if (pathname === '/bookings' && req.method === 'GET') {
    try {
      const bookings = db.prepare('SELECT date, time, name FROM bookings').all();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(bookings));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Database error' }));
    }
    return;
  }

  if (pathname === '/submit-booking' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const { name, date, time } = body;

      if (!name || !date || !time) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Missing booking data' }));
        return;
      }

      const conflict = db.prepare('SELECT COUNT(*) AS c FROM bookings WHERE date = ? AND time = ?').get(date, time).c;
      if (conflict > 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'This time slot is already taken.' }));
        return;
      }

      const dayCount = db.prepare('SELECT COUNT(*) AS c FROM bookings WHERE date = ?').get(date).c;
      if (dayCount >= 2) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'This day is fully booked.' }));
        return;
      }

      db.prepare('INSERT INTO bookings (name, date, time) VALUES (?, ?, ?)').run(name, date, time);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'Server error' }));
    }
    return;
  }

  // Static files
  if (pathname === '/') {
    serveStatic(res, 'index.html');
  } else {
    serveStatic(res, pathname.slice(1));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});