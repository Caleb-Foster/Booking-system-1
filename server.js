const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
<<<<<<< HEAD
const PORT = 3001;
const startedAt = new Date().toISOString();

// --- DB setup ---
const db = new Database('bookings.db');
db.prepare(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL
  )
`).run();
=======
const PORT = process.env.PORT || 3001;
>>>>>>> a11c36a7527d7bce4871b7ba0a540824f53e9ae7

app.use(express.json());

// --- Health ---
app.get('/health', (req, res) => {
  res.json({ ok: true, pid: process.pid, startedAt });
});

// --- API ---
app.get('/bookings', (req, res) => {
  try {
    console.log('=== FETCHING BOOKINGS ===');
    const all = db.prepare('SELECT date, time, name FROM bookings').all();
    console.log('Raw DB result:', all);
    res.json(all);
  } catch (err) {
    console.error('❌ Error fetching bookings:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

app.post('/submit-booking', (req, res) => {
  console.log('=== BOOKING REQUEST ===');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Body type:', typeof req.body);
  
  const { name, date, time } = req.body;
  console.log('Extracted - name:', name, 'date:', date, 'time:', time);
  
  if (!name || !date || !time) {
    console.log('❌ Missing required fields');
    return res.status(400).json({ success: false, message: 'Missing booking data' });
  }

  try {
    const conflict = db.prepare('SELECT COUNT(*) AS c FROM bookings WHERE date = ? AND time = ?').get(date, time).c;
    if (conflict > 0) {
      return res.status(400).json({ success: false, message: 'This time slot is already taken.' });
    }

    const dayCount = db.prepare('SELECT COUNT(*) AS c FROM bookings WHERE date = ?').get(date).c;
    if (dayCount >= 2) {
      return res.status(400).json({ success: false, message: 'This day is fully booked.' });
    }

    console.log('✅ Inserting booking:', { name, date, time });
    const result = db.prepare('INSERT INTO bookings (name, date, time) VALUES (?, ?, ?)').run(name, date, time);
    console.log('✅ Insert result:', result);
    
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Database error:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// --- Static and root ---
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
<<<<<<< HEAD
  console.log(`Server (pid ${process.pid}) running at http://localhost:${PORT} since ${startedAt}`);
=======
    console.log(`Server running on port ${PORT}`);
    if (process.env.NODE_ENV !== 'production') {
        console.log(`Local development: http://localhost:${PORT}`);
    }
>>>>>>> a11c36a7527d7bce4871b7ba0a540824f53e9ae7
});