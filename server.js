const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ Constants
const AUTH_TOKEN = "secure-token-123";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "yourSecurePassword";

const PLAYLISTS_FILE = path.join(__dirname, "data/playlists.json");
const audioUpload = multer({ dest: "public/audio/" });
const artworkUpload = multer({ dest: "public/artwork/" });

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // static public (audio, artwork)

// ✅ Auth middleware
function isAuthed(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (token === AUTH_TOKEN) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
}

// ✅ Login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.json({ token: AUTH_TOKEN });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// ✅ All playlists
app.get("/api/all-playlists", (req, res) => {
  let playlists = {};
  if (fs.existsSync(PLAYLISTS_FILE)) {
    playlists = JSON.parse(fs.readFileSync(PLAYLISTS_FILE, "utf-8"));
  }
  res.json(playlists);
});

// ✅ Upload audio
app.post("/api/upload-audio", isAuthed, audioUpload.array("files"), (req, res) => {
  if (!req.files) return res.status(400).json({ error: "No files uploaded" });

  req.files.forEach((file) => {
    const newPath = path.join(file.destination, file.originalname);
    fs.renameSync(file.path, newPath);
  });

  const audioFiles = fs
    .readdirSync("public/audio")
    .filter((f) => f.endsWith(".mp3"));
  fs.writeFileSync("public/audio/index.json", JSON.stringify(audioFiles, null, 2));

  res.json({ success: true });
});

// ✅ Upload artwork
app.post("/api/upload-artwork/:id", isAuthed, artworkUpload.single("artwork"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const ext = path.extname(req.file.originalname);
  const newName = `${req.params.id}${ext}`;
  const newPath = path.join(req.file.destination, newName);

  fs.renameSync(req.file.path, newPath);
  res.json({ success: true, file: newName });
});

// ✅ Create playlist
app.post("/api/create-playlist", isAuthed, (req, res) => {
  const newPlaylist = req.body;
  if (!newPlaylist || !newPlaylist.id || !newPlaylist.tracks) {
    return res.status(400).json({ error: "Invalid playlist data" });
  }

  let playlists = {};
  if (fs.existsSync(PLAYLISTS_FILE)) {
    playlists = JSON.parse(fs.readFileSync(PLAYLISTS_FILE, "utf-8"));
  }

  playlists[newPlaylist.id] = {
    name: newPlaylist.name,
    published: newPlaylist.published,
    tracks: newPlaylist.tracks,
    artwork: newPlaylist.artwork || "",
  };

  fs.writeFileSync(PLAYLISTS_FILE, JSON.stringify(playlists, null, 2));
  res.json({ success: true });
});

// ✅ Update playlist
app.post("/api/update-playlist", isAuthed, (req, res) => {
  const { id, name, tracks, published, artwork } = req.body;
  if (!id || !tracks) return res.status(400).json({ error: "Invalid data" });

  let playlists = {};
  if (fs.existsSync(PLAYLISTS_FILE)) {
    playlists = JSON.parse(fs.readFileSync(PLAYLISTS_FILE, "utf-8"));
  }

  playlists[id] = { name, tracks, published, artwork };
  fs.writeFileSync(PLAYLISTS_FILE, JSON.stringify(playlists, null, 2));
  res.json({ success: true });
});

// ✅ Delete playlist
app.post("/api/delete-playlist/:id", isAuthed, (req, res) => {
  const id = req.params.id;
  let playlists = {};
  if (fs.existsSync(PLAYLISTS_FILE)) {
    playlists = JSON.parse(fs.readFileSync(PLAYLISTS_FILE, "utf-8"));
    delete playlists[id];
    fs.writeFileSync(PLAYLISTS_FILE, JSON.stringify(playlists, null, 2));
  }
  res.json({ success: true });
});

// ✅ Delete track
app.post("/api/delete-track/:id", isAuthed, (req, res) => {
  const id = req.params.id;
  const { url } = req.body;

  if (!url) return res.status(400).json({ error: "No track url provided" });

  let playlists = {};
  if (fs.existsSync(PLAYLISTS_FILE)) {
    playlists = JSON.parse(fs.readFileSync(PLAYLISTS_FILE, "utf-8"));
    const playlist = playlists[id];
    if (playlist) {
      playlist.tracks = playlist.tracks.filter((t) => t.url !== url);
      playlists[id] = playlist;
      fs.writeFileSync(PLAYLISTS_FILE, JSON.stringify(playlists, null, 2));
    }
  }

  res.json({ success: true });
});

// ✅ Serve React frontend
app.use(express.static(path.join(__dirname, "client", "dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
