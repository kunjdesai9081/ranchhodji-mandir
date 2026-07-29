const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

app.use(express.json());
app.use(express.static('public'));

// Configure Image Upload Engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, 'photo-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Read/Write Helpers
function getDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    return { aarti: [], purnima: [], events: [], gallery: [] };
  }
}
function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// APIs
app.get('/api/data', (req, res) => {
  res.json(getDB());
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'ranchhodji123') {
    res.json({ success: true, token: 'master-admin-token-2026' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid Admin Credentials' });
  }
});

// Update Aarti Timings
app.post('/api/admin/aarti', (req, res) => {
  const db = getDB();
  db.aarti = req.body.aarti;
  saveDB(db);
  res.json({ success: true, message: 'Aarti timings updated successfully!' });
});

// Update Purnima Dates
app.post('/api/admin/purnima', (req, res) => {
  const db = getDB();
  db.purnima = req.body.purnima;
  saveDB(db);
  res.json({ success: true, message: 'Purnima dates updated successfully!' });
});

// Update Events & Notes
app.post('/api/admin/events', (req, res) => {
  const db = getDB();
  db.events = req.body.events;
  saveDB(db);
  res.json({ success: true, message: 'Events & Notes updated successfully!' });
});

// Photo Upload
app.post('/api/admin/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const db = getDB();
  const photoUrl = '/uploads/' + req.file.filename;
  db.gallery.push(photoUrl);
  saveDB(db);
  res.json({ success: true, photoUrl });
});

// Photo Delete
app.post('/api/admin/delete-photo', (req, res) => {
  const { photoUrl } = req.body;
  const db = getDB();
  db.gallery = db.gallery.filter(item => item !== photoUrl);
  saveDB(db);
  
  // Remove actual file if exists
  const filePath = path.join(__dirname, 'public', photoUrl);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Shree Ranchhodraiji Mandir Server running at http://localhost:${PORT}`);
});
