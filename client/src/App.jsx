import { useEffect, useState } from "react";
import { socket } from "./socket.js";
import Login from "./components/Login.jsx";
import Sidebar from "./components/Sidebar.jsx";
import ChatWindow from "./components/ChatWindow.jsx";

const DEFAULT_ROOMS = ["General", "Tech", "Random"];

export default function App() {
  const [rooms, setRooms] = useState(DEFAULT_ROOMS);
  const [me, setMe] = useState("");
  const [room, setRoom] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState([]);
  const [connected, setConnected] = useState(socket.connected);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const onRooms = (list) => setRooms(list);
    const onConnect = () => {
      setConnected(true);
      socket.emit("rooms:get", (list) => list && setRooms(list));
    };
    const onDisconnect = () => setConnected(false);
    const onJoined = ({ room, history, users }) => {
      setRoom(room);
      setMessages(history);
      setUsers(users);
      setTyping([]);
    };
    const onUsers = (list) => setUsers(list);
    const onMessage = (m) => setMessages((prev) => [...prev, m]);
    const onTyping = ({ user, isTyping }) =>
      setTyping((prev) => {
        const without = prev.filter((u) => u !== user);
        return isTyping ? [...without, user] : without;
      });
    const onError = (text) => {
      setNotice(text);
      setTimeout(() => setNotice(""), 3500);
    };

    socket.on("rooms", onRooms);
    if (socket.connected) onConnect(); // already connected (e.g. hot reload)
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("room:joined", onJoined);
    socket.on("room:users", onUsers);
    socket.on("message", onMessage);
    socket.on("typing", onTyping);
    socket.on("error:message", onError);

    return () => {
      socket.off("rooms", onRooms);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("room:joined", onJoined);
      socket.off("room:users", onUsers);
      socket.off("message", onMessage);
      socket.off("typing", onTyping);
      socket.off("error:message", onError);
    };
  }, []);

  if (!me) {
    return <Login rooms={rooms} connected={connected} onLoggedIn={setMe} />;
  }

  return (
    <div className="chat">
      <Sidebar
        rooms={rooms}
        currentRoom={room}
        users={users}
        me={me}
        onSwitch={(r) => r !== room && socket.emit("room:switch", r)}
      />
      <ChatWindow
        me={me}
        room={room}
        messages={messages}
        typing={typing}
        connected={connected}
        notice={notice}
      />
    </div>
  );
}
