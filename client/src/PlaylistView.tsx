import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface Track {
  name: string;
  url: string;
}

interface Playlist {
  name: string;
  tracks: Track[];
}

const PlaylistView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = searchParams.get('id');
    if (!id) {
      setError('No playlist ID provided in the URL.');
      return;
    }

    fetch(`/api/playlist/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Playlist not found');
        return res.json();
      })
      .then(data => setPlaylist(data))
      .catch(err => setError(err.message));
  }, [searchParams]);

  if (error) return <div className="text-red-400 p-4">{error}</div>;
  if (!playlist) return <div className="text-white p-4">Loading...</div>;

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">{playlist.name}</h1>
      {playlist.tracks.map((track, idx) => (
        <div key={idx} className="mb-6">
          <p className="text-lg mb-2">{track.name}</p>
          <audio controls className="w-full max-w-xl">
            <source src={track.url} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      ))}
    </div>
  );
};

export default PlaylistView;
