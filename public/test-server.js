const express = require('express');
const app = express();
app.use(express.json());
app.post('/submit-booking', (req, res) => res.json({ success: true }));
app.listen(5000, () => console.log('Test server running on 5000'));