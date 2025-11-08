import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminUpload from './components/AdminUpload';
import PlaylistView from './components/PlaylistView';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" />} />
      <Route path="/admin" element={<AdminUpload />} />
      <Route path="/playlist" element={<PlaylistView />} />
    </Routes>
  );
};

export default App;
