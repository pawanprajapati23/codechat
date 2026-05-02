# CodeChat

CodeChat is a mobile-first real-time chat app built with React, Socket.IO, and a Node/Express backend. I built it as a small, practical messaging experience: users can enter a name, join a room with a PIN, send messages, share attachments, react with emojis, and start audio or video calls from the same room.

The UI is intentionally inspired by familiar messaging apps, with a WhatsApp-style join flow, chat layout, and in-call controls. The project focuses on the details that make a chat app feel usable on phones first, not just resized for mobile.

## Live Project

- Frontend: https://codechatlove.vercel.app/
- Backend: https://codechat-2atb.onrender.com

## What It Does

- Join a private room using a display name and room PIN
- Real-time messaging with Socket.IO
- Mobile-first chat interface with message bubbles, timestamps, typing indicators, and user count
- Audio and video calls using WebRTC signaling over Socket.IO
- Video call controls for mute, camera on/off, camera switch, and hang up
- Self video preview during calls, similar to modern messaging apps
- Emoji picker and message reactions
- Image and PDF sharing with file size validation
- Voice message recording
- Code block rendering with syntax highlighting
- Chat export and share-room helpers
- Dark mode support
- Local storage for chat history and preferences

## Tech Stack

**Frontend**

- React 19
- Vite
- Tailwind CSS
- Socket.IO Client
- WebRTC browser APIs
- Lucide icons
- emoji-picker-react
- react-syntax-highlighter

**Backend**

- Node.js
- Express
- Socket.IO
- Helmet, CORS, compression, rate limiting
- Redis/MongoDB dependencies are included for scalable persistence work

## Project Structure

```text
codechat/
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   └── utils/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Join.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   ├── VideoCall.jsx
│   │   │   └── VoiceRecorder.jsx
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## Local Setup

Clone the repo and install both apps:

```bash
git clone https://github.com/pawanprajapati23/codechat.git
cd codechat

cd backend
npm install

cd ../frontend
npm install
```

Create a frontend environment file:

```bash
cd frontend
echo "VITE_BACKEND_URL=http://localhost:3001" > .env
```

Run the backend:

```bash
cd backend
npm run dev
```

Run the frontend in another terminal:

```bash
cd frontend
npm run dev
```

## Available Scripts

Frontend:

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

Backend:

```bash
npm start
npm run dev
```

## Real-Time Events

The app uses Socket.IO for room and WebRTC signaling events.

Chat events:

- `join`
- `sendMessage`
- `message`
- `typing`
- `stopTyping`
- `reaction`
- `leave`
- `userCount`
- `systemMessage`

Call signaling events:

- `call:join`
- `call:offer`
- `call:answer`
- `call:ice-candidate`
- `call:leave`
- `call:end`
- `call:user-joined`
- `call:user-left`
- `call:ended`

## Notes For Reviewers

This project is not just a static UI. The main parts I wanted to demonstrate are:

- Real-time room state with Socket.IO
- Practical WebRTC call flow with offer, answer, ICE candidate handling, and media track replacement
- Mobile-first component design
- Small UX details like copy feedback, generated room PINs, typing states, self video preview, and call controls
- Clean separation between chat UI, socket connection utilities, message components, and call UI

## Current Status

The app supports chat, attachments, emoji reactions, voice recording, audio calls, video calls, self preview, camera toggle, and camera switching. The frontend production build is passing.

## License

MIT
