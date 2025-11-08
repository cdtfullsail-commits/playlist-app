// @ts-nocheck
import React, { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";

interface Track {
  name: string;
  url: string;
}

interface Playlist {
  name: string;
  published: boolean;
  tracks: Track[];
}

const PlaylistEditor: React.FC = () => {
  const [playlists, setPlaylists] = useState<{ [id: string]: Playlist }>({});
  const [selectedId, setSelectedId] = useState("");
  const [editing, setEditing] = useState<Playlist | null>(null);
  const [availableTracks, setAvailableTracks] = useState<Track[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Load all playlists
    fetch("/api/all-playlists")
      .then((res) => res.json())
      .then(setPlaylists)
      .catch(() => console.warn("Failed to load playlists."));

    // Load available MP3 files
    fetch("/audio/index.json")
      .then((res) => res.json())
      .then((trackList: string[]) => {
        const trackData = trackList.map((name) => ({
          name,
          url: `/audio/${name}`,
        }));
        setAvailableTracks(trackData);
      })
      .catch(() =>
        console.warn("No /audio/index.json found; manually add one if needed.")
      );
  }, []);

  const loadPlaylist = (id: string) => {
    if (!id) return;
    setSelectedId(id);
    const copy = JSON.parse(JSON.stringify(playlists[id]));
    setEditing(copy);
    setMessage("");
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || !editing) return;
    const reordered = Array.from(editing.tracks);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setEditing({ ...editing, tracks: reordered });
  };

  const toggleTrack = (track: Track) => {
    if (!editing) return;
    const exists = editing.tracks.find((t) => t.url === track.url);
    const updated = exists
      ? editing.tracks.filter((t) => t.url !== track.url)
      : [...editing.tracks, track];
    setEditing({ ...editing, tracks: updated });
  };

  const saveChanges = async () => {
    if (!editing || !selectedId) return;
    const payload = {
      id: selectedId,
      name: editing.name,
      published: editing.published,
      tracks: editing.tracks,
    };

    const res = await fetch("/api/update-playlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    setMessage(result.success ? "✅ Playlist updated" : "❌ Update failed");
  };

  return (
    <div className="p-6 text-white max-w-4xl mx-auto bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Playlist Editor</h1>

      {/* Accessible label for select */}
      <label
        htmlFor="playlist-select"
        className="block mb-2 font-semibold text-gray-200"
      >
        Select Playlist to Edit:
      </label>
      <select
        id="playlist-select"
        onChange={(e) => loadPlaylist(e.target.value)}
        className="text-black p-2 mb-4 w-full rounded"
        defaultValue=""
        aria-label="Playlist selector"
      >
        <option value="" disabled>
          Choose a playlist
        </option>
        {Object.keys(playlists).map((id) => (
          <option key={id} value={id}>
            {id} - {playlists[id].name}
          </option>
        ))}
      </select>

      {editing && (
        <>
          <div className="mb-4">
            <label
              htmlFor="playlist-name"
              className="block mb-2 font-semibold text-gray-200"
            >
              Playlist Name:
            </label>
            <input
              id="playlist-name"
              className="text-black p-2 w-full rounded"
              placeholder="Enter playlist name"
              value={editing.name}
              onChange={(e) =>
                setEditing({ ...editing, name: e.target.value })
              }
            />
          </div>

          <div className="mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={editing.published}
                onChange={(e) =>
                  setEditing({ ...editing, published: e.target.checked })
                }
              />
              <span className="ml-2">Published</span>
            </label>
          </div>

          {/* Playlist Tracks with Drag & Drop */}
          <h3 className="text-lg mt-6 mb-2 font-semibold">Tracks in Playlist</h3>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="tracks">
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="mb-4"
                >
                  {editing.tracks.map((track, index) => (
                    <Draggable
                      key={track.url}
                      draggableId={track.url}
                      index={index}
                    >
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-gray-700 rounded p-2 mb-2"
                        >
                          {track.name}
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>

          {/* Available Tracks */}
          <h3 className="text-lg mt-6 mb-2 font-semibold">
            Add or Remove Tracks
          </h3>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {availableTracks.map((track) => {
              const active = editing.tracks.find((t) => t.url === track.url);
              return (
               // ARIA-compliant pressed state for accessibility
<button
  key={track.url}
  onClick={() => toggleTrack(track)}
  className={`p-2 border rounded ${
    active ? "bg-green-500 border-green-700" : "bg-gray-600 border-gray-400"
  }`}
  aria-pressed={active}
  aria-label={`Toggle ${track.name}`}
>
  {track.name}
</button>


              );
            })}
          </div>

          {/* Save Button */}
          <button
            onClick={saveChanges}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
          >
            Save Playlist
          </button>

          {message && <p className="mt-4 text-green-300">{message}</p>}
        </>
      )}
    </div>
  );
};

export default PlaylistEditor;
