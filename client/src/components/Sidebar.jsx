export default function Sidebar({ rooms, currentRoom, users, me, onSwitch }) {
  return (
    <aside className="sidebar">
      <h2>Rooms</h2>
      <ul className="room-list">
        {rooms.map((r) => (
          <li
            key={r}
            className={r === currentRoom ? "active" : ""}
            onClick={() => onSwitch(r)}
          >
            {r}
          </li>
        ))}
      </ul>

      <h2>Online ({users.length})</h2>
      <ul className="user-list">
        {users.map((u) => (
          <li key={u}>{u === me ? `${u} (you)` : u}</li>
        ))}
      </ul>
    </aside>
  );
}
