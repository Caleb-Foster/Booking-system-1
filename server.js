const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Register the POST route FIRST
app.post('/submit-booking', (req, res) => {
    const { name, date, time } = req.body;
    if (!name || !date || !time) {
        return res.status(400).json({ success: false, message: 'Missing booking data' });
    }
    console.log('Booking received:', req.body);
    res.json({ success: true });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    if (process.env.NODE_ENV !== 'production') {
        console.log(`Local development: http://localhost:${PORT}`);
    }
});