const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve frontend build
app.use(express.static(path.join(__dirname, 'client', 'dist')));
app.use('/audio', express.static(path.join(__dirname, 'public', 'audio')));
app.use(express.json());

// File upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/audio'),
  filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

const PLAYLIST_FILE = path.join(__dirname, 'data', 'playlists.json');

// API: Get a playlist
app.get('/api/playlist/:id', (req, res) => {
  const playlists = JSON.parse(fs.readFileSync(PLAYLIST_FILE));
  const playlist = playlists[req.params.id];
  playlist
    ? res.json(playlist)
    : res.status(404).json({ error: 'Playlist not found' });
});

// API: Upload and create playlist
app.post('/api/create-playlist', upload.array('tracks'), (req, res) => {
  const { playlistId, playlistName } = req.body;
  const playlists = JSON.parse(fs.readFileSync(PLAYLIST_FILE));

  const tracks = req.files.map(file => ({
    name: file.originalname,
    url: `/audio/${file.originalname}`
  }));

  playlists[playlistId] = { name: playlistName, tracks };
  fs.writeFileSync(PLAYLIST_FILE, JSON.stringify(playlists, null, 2));

  res.json({ success: true });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Get all playlists (for admin dashboard)
app.get('/api/all-playlists', (req, res) => {
  const playlists = JSON.parse(fs.readFileSync(PLAYLIST_FILE));
  res.json(playlists);
});

// Update a playlist (name, tracks, order, published)
app.post('/api/update-playlist', (req, res) => {
  const { id, name, tracks, published } = req.body;

  if (!id || !name || !Array.isArray(tracks)) {
    return res.status(400).json({ error: 'Invalid playlist data' });
  }

  const playlists = JSON.parse(fs.readFileSync(PLAYLIST_FILE));
  playlists[id] = { name, tracks, published };
  fs.writeFileSync(PLAYLIST_FILE, JSON.stringify(playlists, null, 2));
  res.json({ success: true });
});

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "yourSecurePassword";
const AUTH_TOKEN = "secure-token-123"; // Any string you like

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return res.json({ token: AUTH_TOKEN });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

app.use('/api/protected', (req, res, next) => {
  const token = req.headers.authorization;
  if (token === `Bearer ${AUTH_TOKEN}`) {
    next();
  } else {
    res.status(403).json({ error: 'Unauthorized' });
  }
});
