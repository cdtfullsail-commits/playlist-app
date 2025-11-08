import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) throw new Error("Invalid login");

      const data = await res.json();
      localStorage.setItem("authToken", data.token);
      navigate("/admin");
    } catch (err) {
      setError("❌ Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-6">
      <h2 className="text-3xl font-bold mb-6">Admin Login</h2>
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <input
          className="w-full p-2 rounded text-black"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          className="w-full p-2 rounded text-black"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 w-full py-2 rounded hover:bg-blue-700"
        >
          Log In
        </button>
        {error && <p className="text-red-400">{error}</p>}
      </form>
    </div>
  );
};

export default Login;
