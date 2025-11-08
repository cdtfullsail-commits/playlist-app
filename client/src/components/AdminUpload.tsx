import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminUpload: React.FC = () => {
  const [name, setName] = useState("");
  const [published, setPublished] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  const [artwork, setArtwork] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
    setSelectedTracks([]); // reset
  };

  const handleTrackToggle = (filename: string) => {
    setSelectedTracks((prev) =>
      prev.includes(filename)
        ? prev.filter((t) => t !== filename)
        : [...prev, filename]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || selectedTracks.length === 0 || !name) {
      return setMessage("Please enter name, upload audio, and select tracks.");
    }

    const token = localStorage.getItem("token");

    // Step 1: Upload audio files
    const audioForm = new FormData();
    Array.from(files).forEach((file) => audioForm.append("files", file));

    const audioRes = await fetch("/api/upload-audio", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: audioForm,
    });

    if (!audioRes.ok) {
      return setMessage("Audio upload failed");
    }

    // Step 2: Upload artwork
    let artworkFilename = "";
    if (artwork) {
      const artForm = new FormData();
      artForm.append("artwork", artwork);

      const artRes = await fetch(`/api/upload-artwork/${name}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: artForm,
      });

      if (artRes.ok) {
        artworkFilename = `${name}${artwork.name.slice(-4)}`;
      }
    }

    // Step 3: Create playlist data
    const playlist = {
      name,
      published,
      tracks: selectedTracks.map((name) => ({
        name,
        url: `/audio/${name}`,
      })),
      artwork: artworkFilename,
    };

    const payload = {
      id: name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
      ...playlist,
    };

    const saveRes = await fetch("/api/create-playlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (saveRes.ok) {
      setMessage("✅ Playlist created!");
      navigate("/admin");
    } else {
      setMessage("❌ Failed to save playlist.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 text-white bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Create New Playlist</h1>

      {message && <p className="mb-4 text-green-400">{message}</p>}

      <form onSubmit={handleSubmit}>
        <label className="block mb-2 font-semibold" htmlFor="playlist-name">
          Playlist Name
        </label>
        <input
          id="playlist-name"
          type="text"
          placeholder="e.g. Studio Vibes Vol. 1"
          title="Enter a name for your playlist"
          className="w-full p-2 mb-4 rounded text-black"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label className="block mb-2 font-semibold" htmlFor="mp3-upload">
          Upload MP3 Files
        </label>
        <input
          id="mp3-upload"
          type="file"
          multiple
          accept="audio/mp3"
          className="mb-4"
          title="Upload one or more MP3 files"
          onChange={handleFileSelect}
          required
        />

        {files && (
          <div className="mb-4">
            <h3 className="mb-2 font-semibold">Select Tracks for Playlist</h3>
            {Array.from(files).map((file) => (
              <label
                key={file.name}
                className="block bg-gray-700 p-2 rounded mb-2"
              >
                <input
                  type="checkbox"
                  checked={selectedTracks.includes(file.name)}
                  onChange={() => handleTrackToggle(file.name)}
                  title={`Include ${file.name} in playlist`}
                />
                <span className="ml-2">{file.name}</span>
              </label>
            ))}
          </div>
        )}

        <label
          className="block mb-2 font-semibold"
          htmlFor="artwork-upload"
        >
          Upload Artwork (optional)
        </label>
        <input
          id="artwork-upload"
          type="file"
          accept="image/*"
          className="mb-4"
          title="Upload optional cover artwork"
          onChange={(e) => setArtwork(e.target.files?.[0] || null)}
        />

        <label
          className="inline-flex items-center mb-4"
          htmlFor="publish-toggle"
        >
          <input
            id="publish-toggle"
            type="checkbox"
            checked={published}
            title="Check to publish immediately"
            onChange={(e) => setPublished(e.target.checked)}
          />
          <span className="ml-2">Publish now</span>
        </label>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded"
          title="Click to create playlist"
        >
          Create Playlist
        </button>
      </form>
    </div>
  );
};

export default AdminUpload;
