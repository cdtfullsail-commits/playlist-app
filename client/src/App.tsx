import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminUpload from "./components/AdminUpload";
import PlaylistView from "./components/PlaylistView";
import PlaylistEditor from "./components/PlaylistEditor";
import Login from "./components/Login";
import { isLoggedIn } from "./auth";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  return isLoggedIn() ? children : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PlaylistView />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminUpload />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit"
          element={
            <ProtectedRoute>
              <PlaylistEditor />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
import AdminDashboard from './components/AdminDashboard';
// ...
<Route
  path="/admin"
  element={
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
