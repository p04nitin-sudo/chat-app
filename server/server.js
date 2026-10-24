require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const Message = require("./models/Message");

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/chatapp";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const ROOMS = ["General", "Tech", "Random"];
const HISTORY_LIMIT = 50;

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.get("/api/health", (_req, res) => res.json({ ok: true }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: CLIENT_ORIGIN } });

const users = new Map(); // socket.id -> { username, room }

const usersInRoom = (room) =>
  [...users.values()].filter((u) => u.room === room).map((u) => u.username);

const broadcastUsers = (room) => io.to(room).emit("room:users", usersInRoom(room));

const systemMessage = (room, text) =>
  io.to(room).emit("message", { type: "system", text, time: Date.now() });

async function getHistory(room) {
  const docs = await Message.find({ room })
    .sort({ createdAt: -1 })
    .limit(HISTORY_LIMIT)
    .lean();
  return docs.reverse().map((d) => ({
    type: "user",
    user: d.user,
    text: d.text,
    time: new Date(d.createdAt).getTime(),
  }));
}

async function joinRoom(socket, room) {
  const user = users.get(socket.id);
  if (!user || !ROOMS.includes(room)) return;

  if (user.room) {
    const old = user.room;
    socket.leave(old);
    user.room = null;
    systemMessage(old, `${user.username} left the room`);
    broadcastUsers(old);
  }

  user.room = room;
  socket.join(room);
  const history = await getHistory(room);
  socket.emit("room:joined", { room, history, users: usersInRoom(room) });
  systemMessage(room, `${user.username} joined the room`);
  broadcastUsers(room);
}

io.on("connection", (socket) => {
  socket.emit("rooms", ROOMS);
  socket.on("rooms:get", (ack) => typeof ack === "function" && ack(ROOMS));

  socket.on("login", async ({ username, room } = {}, ack = () => {}) => {
    const name = String(username || "").trim().slice(0, 20);
    if (!name) return ack({ ok: false, error: "Enter a username." });

    const taken = [...users.values()].some(
      (u) => u.username.toLowerCase() === name.toLowerCase()
    );
    if (taken) return ack({ ok: false, error: "That username is already in use." });

    users.set(socket.id, { username: name, room: null });
    ack({ ok: true, username: name });
    try {
      await joinRoom(socket, ROOMS.includes(room) ? room : ROOMS[0]);
    } catch (err) {
      console.error("joinRoom error:", err.message);
    }
  });

  socket.on("room:switch", async (room) => {
    try {
      await joinRoom(socket, room);
    } catch (err) {
      console.error("switch error:", err.message);
    }
  });

  socket.on("message", async (text) => {
    const user = users.get(socket.id);
    const clean = String(text || "").trim().slice(0, 1000);
    if (!user || !user.room || !clean) return;

    try {
      const saved = await Message.create({ room: user.room, user: user.username, text: clean });
      io.to(user.room).emit("message", {
        type: "user",
        user: saved.user,
        text: saved.text,
        time: saved.createdAt.getTime(),
      });
    } catch (err) {
      console.error("save message error:", err.message);
      socket.emit("error:message", "Message could not be saved. Try again.");
    }
  });

  socket.on("typing", (isTyping) => {
    const user = users.get(socket.id);
    if (!user || !user.room) return;
    socket.to(user.room).emit("typing", { user: user.username, isTyping: !!isTyping });
  });

  socket.on("disconnect", () => {
    const user = users.get(socket.id);
    if (!user) return;
    users.delete(socket.id);
    if (user.room) {
      systemMessage(user.room, `${user.username} disconnected`);
      broadcastUsers(user.room);
    }
  });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected:", MONGO_URI);
    server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    console.error("MongoDB chal raha hai? Ya MONGO_URI (server/.env) check karo.");
    process.exit(1);
  });
