import React, { useState, ChangeEvent, FormEvent } from 'react';

const AdminUpload: React.FC = () => {
  const [playlistId, setPlaylistId] = useState('');
  const [playlistName, setPlaylistName] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState('');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!playlistId || !playlistName || files.length === 0) {
      setMessage('❗ All fields are required.');
      return;
    }

    const formData = new FormData();
    formData.append('playlistId', playlistId);
    formData.append('playlistName', playlistName);
    files.forEach(file => formData.append('tracks', file));

    try {
      const res = await fetch('/api/create-playlist', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (result.success) {
        setMessage(`✅ Playlist created! Share this: /playlist.html?id=${playlistId}`);
        setFiles([]);
      } else {
        setMessage('❌ Failed to create playlist.');
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="p-6 bg-gray-800 text-white rounded shadow max-w-xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Create a Playlist</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Playlist ID"
          className="w-full p-2 mb-3 text-black"
          value={playlistId}
          onChange={(e) => setPlaylistId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Playlist Name"
          className="w-full p-2 mb-3 text-black"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
        />
        <input
          type="file"
          accept=".mp3"
          multiple
          className="w-full p-2 mb-3"
          onChange={handleFileChange}
        />
        <button
          type="submit"
          className="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded text-white"
        >
          Upload Playlist
        </button>
      </form>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
};

export default AdminUpload;
