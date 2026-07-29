const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

app.use(express.json());

// Serve static files from BOTH root and public directory
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'Public')));

// Upload configuration
const uploadDir = fs.existsSync(path.join(__dirname, 'public', 'uploads'))
  ? path.join(__dirname, 'public', 'uploads')
  : path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, 'photo-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Database Helper Functions
function getDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    return { aarti: [], purnima: [], events: [], gallery: [] };
  }
}

function saveDB(data) {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Serve Main Homepage
app.get('/', (req, res) => {
  const rootIndex = path.join(__dirname, 'index.html');
  const publicIndex = path.join(__dirname, 'public', 'index.html');

  if (fs.existsSync(rootIndex)) {
    res.sendFile(rootIndex);
  } else if (fs.existsSync(publicIndex)) {
    res.sendFile(publicIndex);
  } else {
    res.status(404).send('index.html not found on server');
  }
});

// API Routes
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

app.post('/api/admin/aarti', (req, res) => {
  const db = getDB();
  db.aarti = req.body.aarti;
  saveDB(db);
  res.json({ success: true, message: 'Aarti timings updated successfully!' });
});

app.post('/api/admin/purnima', (req, res) => {
  const db = getDB();
  db.purnima = req.body.purnima;
  saveDB(db);
  res.json({ success: true, message: 'Purnima dates updated successfully!' });
});

app.post('/api/admin/events', (req, res) => {
  const db = getDB();
  db.events = req.body.events;
  saveDB(db);
  res.json({ success: true, message: 'Events & Notes updated successfully!' });
});

app.post('/api/admin/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const db = getDB();
  const photoUrl = '/uploads/' + req.file.filename;
  db.gallery.push(photoUrl);
  saveDB(db);
  res.json({ success: true, photoUrl });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
