import { io } from "socket.io-client";

const URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

// ek hi shared socket instance poori app me
export const socket = io(URL);
