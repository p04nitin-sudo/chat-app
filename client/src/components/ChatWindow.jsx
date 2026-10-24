import { useEffect, useRef, useState } from "react";
import { socket } from "../socket.js";

const fmtTime = (t) =>
  new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function ChatWindow({ me, room, messages, typing, connected, notice }) {
  const [text, setText] = useState("");
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  // naya message aaye to neeche scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleChange = (e) => {
    setText(e.target.value);
    socket.emit("typing", true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => socket.emit("typing", false), 1200);
  };

  const handleSend = (e) => {
    e.preventDefault();
    const clean = text.trim();
    if (!clean) return;
    socket.emit("message", clean);
    socket.emit("typing", false);
    setText("");
  };

  const others = typing.filter((u) => u !== me);
  const typingText =
    others.length === 0
      ? ""
      : others.length === 1
      ? `${others[0]} is typing...`
      : `${others.join(", ")} are typing...`;

  return (
    <section className="main">
      <header>
        <h2># {room}</h2>
        <span className="me">
          {connected ? `Signed in as ${me}` : "Reconnecting..."}
        </span>
      </header>

      <div className="messages" aria-live="polite">
        {messages.map((m, i) =>
          m.type === "system" ? (
            <div key={i} className="system">{m.text}</div>
          ) : (
            <div key={i} className={`msg ${m.user === me ? "mine" : "theirs"}`}>
              <div className="meta">
                {m.user === me ? "You" : m.user} · {fmtTime(m.time)}
              </div>
              <div>{m.text}</div>
            </div>
          )
        )}
        <div ref={bottomRef} />
      </div>

      <div className="typing">{notice || typingText}</div>

      <form className="composer" onSubmit={handleSend}>
        <input
          value={text}
          onChange={handleChange}
          placeholder="Write a message"
          maxLength={1000}
          autoComplete="off"
          autoFocus
        />
        <button type="submit" disabled={!connected}>Send</button>
      </form>
    </section>
  );
}
