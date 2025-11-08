import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface PlaylistSummary {
  name: string;
  published: boolean;
  tracks: { name: string; url: string }[];
  artwork?: string;
}

const AdminDashboard: React.FC = () => {
  const [playlists, setPlaylists] = useState<{ [id: string]: PlaylistSummary }>({});
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const fetchPlaylists = () => {
    fetch("/api/all-playlists")
      .then((res) => res.json())
      .then(setPlaylists)
      .catch(() => setMessage("❌ Failed to load playlists."));
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this playlist?")) return;
    const res = await fetch(`/api/delete-playlist/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setMessage("✅ Playlist deleted.");
      fetchPlaylists();
    } else {
      setMessage("❌ Delete failed.");
    }
  };

  const handleArtworkUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    playlistId: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("artwork", file);

    const res = await fetch(`/api/upload-artwork/${playlistId}`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.success) {
      setMessage("✅ Artwork uploaded.");
      fetchPlaylists();
    } else {
      setMessage("❌ Upload failed.");
    }
  };

  return (
    <div className="p-6 text-white max-w-4xl mx-auto bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {message && <p className="mb-4 text-green-400">{message}</p>}

      {Object.keys(playlists).length === 0 ? (
        <p>No playlists available.</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(playlists).map(([id, playlist]) => (
            <div
              key={id}
              className="bg-gray-800 p-4 rounded shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{playlist.name}</h2>
                <p className="text-sm text-gray-300">
                  {playlist.tracks.length} track(s) |{" "}
                  {playlist.published ? "✅ Published" : "📝 Draft"}
                </p>
                {playlist.artwork && (
                  <img
                    src={`/artwork/${playlist.artwork}`}
                    alt="Playlist artwork"
                    className="w-32 h-32 mt-2 object-cover rounded"
                  />
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <button
                  onClick={() => navigate(`/edit?id=${id}`)}
                  className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(id)}
                  className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
                >
                  Delete
                </button>
                <label className="text-sm">
                  Upload Artwork
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleArtworkUpload(e, id)}
                    className="block mt-1"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
