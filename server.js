const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

const PLAYLIST_FILE = path.join(__dirname, "data", "playlists.json");

app.use(cors());
app.use(express.json());

// Serve static files
app.use("/audio", express.static(path.join(__dirname, "public", "audio")));
app.use("/artwork", express.static(path.join(__dirname, "public", "artwork")));

// Auth config
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "yourSecurePassword";
const AUTH_TOKEN = "secure-token-123";

// Login route
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return res.json({ token: AUTH_TOKEN });
  }
  return res.status(401).json({ error: "Invalid credentials" });
});

// Auth middleware for protected routes
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token === AUTH_TOKEN) {
    next();
  } else {
    res.status(403).json({ error: "Unauthorized" });
  }
};

// Get all playlists
app.get("/api/all-playlists", (req, res) => {
  const playlists = JSON.parse(fs.readFileSync(PLAYLIST_FILE));
  res.json(playlists);
});

// Save or update a playlist
app.post("/api/update-playlist", requireAuth, (req, res) => {
  const { id, name, tracks, published } = req.body;

  if (!id || !name || !Array.isArray(tracks)) {
    return res.status(400).json({ error: "Invalid playlist data" });
  }

  const playlists = JSON.parse(fs.readFileSync(PLAYLIST_FILE));
  playlists[id] = { ...playlists[id], name, tracks, published };
  fs.writeFileSync(PLAYLIST_FILE, JSON.stringify(playlists, null, 2));
  res.json({ success: true });
});

// Delete a playlist
app.delete("/api/delete-playlist/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const playlists = JSON.parse(fs.readFileSync(PLAYLIST_FILE));

  if (!playlists[id]) {
    return res.status(404).json({ error: "Playlist not found" });
  }

  delete playlists[id];
  fs.writeFileSync(PLAYLIST_FILE, JSON.stringify(playlists, null, 2));
  res.json({ success: true });
});

// Upload artwork for a playlist
const artworkStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "public", "artwork"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const playlistId = req.params.id;
    cb(null, `${playlistId}${ext}`);
  },
});

const uploadArtwork = multer({ storage: artworkStorage });

app.post(
  "/api/upload-artwork/:id",
  requireAuth,
  uploadArtwork.single("artwork"),
  (req, res) => {
    const { id } = req.params;
    const playlists = JSON.parse(fs.readFileSync(PLAYLIST_FILE));

    if (!playlists[id]) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    playlists[id].artwork = req.file.filename;
    fs.writeFileSync(PLAYLIST_FILE, JSON.stringify(playlists, null, 2));
    res.json({ success: true });
  }
);

const path = require("path");

// Serve static files from the Vite build
app.use(express.static(path.join(__dirname, "client", "dist")));

// Fallback for React Router (SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
