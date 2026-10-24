import { useState } from "react";
import { socket } from "../socket.js";

export default function Login({ rooms, connected, onLoggedIn }) {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    socket.emit("login", { username, room: room || rooms[0] }, (res) => {
      if (!res.ok) return setError(res.error);
      onLoggedIn(res.username);
    });
  };

  return (
    <main className="login">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Join the conversation</h1>
        <p>Pick a name and a room. You can switch rooms any time.</p>

        <label htmlFor="username">Username</label>
        <input
          id="username"
          value={username}
          maxLength={20}
          autoComplete="off"
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label htmlFor="room">Room</label>
        <select id="room" value={room || rooms[0] || ""} onChange={(e) => setRoom(e.target.value)}>
          {rooms.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <p className="error" role="alert">
          {error || (!connected ? "Connecting to server..." : "")}
        </p>
        <button type="submit" disabled={!connected}>Join chat</button>
      </form>
    </main>
  );
}
