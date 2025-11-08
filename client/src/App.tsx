import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import AdminUpload from "./components/AdminUpload";
import PlaylistEditor from "./components/PlaylistEditor";
import PlaylistView from "./components/PlaylistView";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/upload" element={<AdminUpload />} />
      <Route path="/edit" element={<PlaylistEditor />} />
      <Route path="/playlist" element={<PlaylistView />} />
    </Routes>
  );
};

export default App;
