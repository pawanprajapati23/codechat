# CodeChat

CodeChat is a modern, mobile-first real-time chat application designed for seamless messaging and rich media sharing. Built with a focus on responsiveness and user experience, it provides a familiar and intuitive interface for real-time communication.

## 🚀 Features

- **Real-Time Chat:** Instant messaging powered by Socket.IO with typing indicators and read receipts.
- **Authentication (JWT):** Secure user authentication using JSON Web Tokens and password hashing with bcrypt.
- **Guest + User Mode:** Flexibility to join as a registered user or enter chat rooms as a guest.
- **Chat History:** Persistent chat history and message storage using MongoDB.
- **Audio & Video Calls:** Peer-to-peer calling capabilities integrated directly into the chat interface using WebRTC.
- **Rich Media Sharing:** Support for image sharing, PDF attachments, and voice message recording.
- **Emoji Reactions:** Interactive emoji reactions on messages.
- **Dark Mode Support:** Built-in theme support for comfortable viewing in any environment.

## 🛠 Tech Stack

### Frontend
- **Framework:** React 19 (Vite)
- **Styling:** Tailwind CSS
- **Real-Time:** Socket.IO Client
- **Communication:** WebRTC APIs
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **Real-Time:** Socket.IO
- **Security:** JWT, Helmet, CORS, Rate Limiting

## 🌐 Live Demo

- **Frontend:** [https://codechatlove.vercel.app/](https://codechatlove.vercel.app/)
- **Backend:** [https://codechat-2atb.onrender.com](https://codechat-2atb.onrender.com)

## 📥 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pawanprajapati23/codechat.git
   cd codechat
   ```

2. **Install dependencies:**
   
   Root dependencies (for development):
   ```bash
   npm install
   ```

   Backend dependencies:
   ```bash
   cd backend
   npm install
   ```

   Frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in both `backend/` and `frontend/` directories using the provided `.env.example` as a template.

   **Backend `.env`:**
   ```env
   PORT=3001
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=http://localhost:5173
   ```

   **Frontend `.env`:**
   ```env
   VITE_BACKEND_URL=http://localhost:3001
   ```

## 🚀 Running the Project

### Using Concurrently (from root)
Run both backend and frontend simultaneously:
```bash
npm run dev
```

### Manual Execution

**Start Backend:**
```bash
cd backend
npm run dev
```

**Start Frontend:**
```bash
cd frontend
npm run dev
```

## 📁 Project Structure

```text
codechat/
├── backend/          # Node.js + Express server
│   ├── src/          # Source code
│   └── package.json
├── frontend/         # React + Vite application
│   ├── src/          # Source code
│   └── package.json
├── .env.example      # Environment variables template
├── .gitignore        # Git ignore rules
├── package.json      # Root package.json
└── README.md         # Project documentation
```

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
