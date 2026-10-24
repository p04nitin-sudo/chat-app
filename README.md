# Real-time Chat App (MERN-style)

**Stack:** React (JSX + Vite) · Node.js + Express · Socket.io · MongoDB (Mongoose)

## Features
- Real-time messaging with Socket.io
- Messages MongoDB me save hote hain (restart ke baad bhi history rehti hai)
- Multiple rooms (General, Tech, Random) aur room switching
- Online users list, typing indicator, join/leave notifications
- Last 50 messages har room ki history
- Reconnect status, responsive UI

## Pehle ye chahiye
1. **Node.js v18+**: https://nodejs.org
2. **MongoDB** (koi ek):
   - Local: MongoDB Community Server install karo, aur wo `mongodb://127.0.0.1:27017` par chalna chahiye
   - Ya free cloud: MongoDB Atlas ka connection string `server/.env` me `MONGO_URI` me daalo

## Run kaise kare

### Option A: ek command se (recommended)
```bash
npm run install:all
npm run dev
```

### Option B: do alag terminals
```bash
# Terminal 1
cd server
npm install
npm run dev

# Terminal 2
cd client
npm install
npm run dev
```

Phir browser me kholo: **http://localhost:5173**
Test ke liye 2 tabs kholo aur alag usernames se join karo.

## Config
`server/.env`
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/chatapp
CLIENT_ORIGIN=http://localhost:5173
```
`client/.env`
```
VITE_SERVER_URL=http://localhost:5000
```

## Folder structure
```
chat-app/
├── package.json            # root scripts (npm run dev)
├── server/
│   ├── server.js           # Express + Socket.io + Mongo connection
│   ├── models/Message.js   # Mongoose schema
│   └── .env
└── client/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx         # socket events + state
        ├── socket.js
        ├── styles.css
        └── components/
            ├── Login.jsx
            ├── Sidebar.jsx
            └── ChatWindow.jsx
```

## Common errors
- **"MongoDB connection failed"**: MongoDB service start nahi hai ya `MONGO_URI` galat hai.
- **Login page par "Connecting to server..."**: backend (port 5000) chal nahi raha.
- **Port already in use**: `server/.env` me `PORT` badlo aur `client/.env` me `VITE_SERVER_URL` update karo.

## Resume ke liye next steps
JWT authentication + user collection, private (1-to-1) messages, image upload, Docker, aur Render/Vercel/Atlas par deploy.
