# 💬 CodeChat - Real-time Anonymous Chat

A beautiful, mobile-first real-time chat application built with React 19, Tailwind CSS v4, and Socket.IO. Perfect for portfolio and interviews.

![React](https://img.shields.io/badge/React-19.2.4-blue?logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind-4.2.2-38B2AC?logo=tailwind-css)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.3-010101?logo=socket.io)
![Mobile First](https://img.shields.io/badge/Mobile-First-success)

---

## ✨ Features

### 🎨 **Modern UI/UX (Mobile-First!)**
- **Beautiful Design** - Unique indigo → purple → pink gradient color scheme
- **Fully Responsive** - Perfect on mobile, tablet, and desktop
- **Dark Mode** - Stunning in both light and dark themes with toggle
- **Smooth Animations** - Natural transitions and micro-interactions
- **Human Touch** - Emojis (💬, 💭, 👋), natural language, designed to feel handcrafted

### 💬 **Chat Features**
- **Real-time Messaging** - Instant delivery via WebSocket (Socket.IO)
- **Message Bubbles** - Left/right aligned with sender/receiver distinction
- **User Avatars** - Auto-generated colored avatars with initials
- **Typing Indicators** - See when someone is typing with animated dots
- **Timestamps** - HH:MM format on each message
- **User Count** - Real-time connected users display
- **Sound Notifications** - Audio alert for new messages
- **Auto-scroll** - Automatically scrolls to latest message
- **✨ Emoji Picker** - Click smile icon to add emojis to messages
- **✨ Code Syntax Highlighting** - Share code with syntax highlighting (```language)
- **✨ Message Reactions** - Double-click messages to add emoji reactions (👍❤️😂)
- **✨ Loading Skeletons** - Beautiful shimmer loading states

### 🔧 **Technical Features**
- **Socket.IO Integration** - Robust WebSocket with reconnection
- **localStorage** - Chat history and preferences persistence
- **Form Validation** - Username (2-20 chars) and room code (4+ chars)
- **Random Code Generator** - 6-character room codes
- **Copy to Clipboard** - Easy code sharing with feedback
- **Environment Variables** - Configurable backend URL

### 📱 **Mobile Optimizations**
- Touch-friendly buttons (44px+ tap targets)
- Responsive text sizing (`text-sm sm:text-base`)
- Smart padding (`px-3 sm:px-4`)
- Sticky header with backdrop blur
- Optimized for thumbs, not just mouse

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Running Socket.IO backend server

### Installation

```bash
# Navigate to frontend
cd codechat/frontend

# Install dependencies
npm install --legacy-peer-deps

# Configure environment
echo "VITE_BACKEND_URL=https://codechat-2atb.onrender.com" > .env

# Start development server
npm run dev

# Open https://codechatlove.vercel.app/
```

---

## 📁 Project Structure

```
codechat/frontend/
├── src/
│   ├── components/
│   │   ├── Join.jsx              # Join screen with validation
│   │   ├── Chat.jsx              # Main chat interface
│   │   ├── Header.jsx            # Chat header with controls
│   │   ├── MessageBubble.jsx     # Individual message component
│   │   ├── MessageInput.jsx      # Message input box
│   │   └── TypingIndicator.jsx   # Typing animation
│   ├── hooks/
│   │   └── useLocalStorage.js    # Custom localStorage hook
│   ├── utils/
│   │   ├── socketConnection.js   # Socket.IO connection logic
│   │   └── helpers.js            # Utility functions
│   ├── App.jsx                   # Main app component
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles
├── index.html                    # HTML template
├── package.json                  # Dependencies
├── vite.config.js                # Vite config
├── tailwind.config.js            # Tailwind config
├── postcss.config.js             # PostCSS config
├── vercel.json                   # Vercel deployment
└── README.md                     # This file
```

---

## 🛠️ Available Scripts

```bash
# Development
npm run dev

# Production build
npm run build

# Preview build
npm run preview

# Lint code
npm run lint
```

---

## 🎨 Color Palette

### Gradient Colors (Unique!)
```
Indigo (500):  #6366f1
Purple (500):  #a855f7
Pink (500):    #ec4899
```

### Light Mode
- Background: `from-indigo-50 via-purple-50 to-pink-50`
- Cards: `bg-white` with `border-gray-200`
- Text: `text-gray-800`

### Dark Mode
- Background: `dark:from-gray-900 dark:via-slate-900 dark:to-gray-900`
- Cards: `dark:bg-gray-800` with `dark:border-gray-700`
- Text: `dark:text-gray-100`

---

## 📦 Dependencies

### Production
- `react` - ^19.2.4
- `react-dom` - ^19.2.4
- `socket.io-client` - ^4.8.3
- `lucide-react` - ^0.263.1
- `emoji-picker-react` - Latest (for emoji picker)
- `react-syntax-highlighter` - Latest (for code highlighting)

### Development
- `vite` - ^8.0.3
- `tailwindcss` - ^4.2.2
- `@tailwindcss/postcss` - ^4.2.2
- `autoprefixer` - Latest
- `eslint` - ^9.39.4

---

## 🌐 Deployment

### Deploy to Vercel

1. **Via CLI**
```bash
npm install -g vercel
vercel login
vercel --prod
```

2. **Via Dashboard**
- Push code to GitHub
- Go to [vercel.com](https://vercel.com)
- Import repository
- Add environment variable: `VITE_BACKEND_URL=https://codechat-2atb.onrender.com`
- Deploy!

### Other Platforms

**Netlify:**
```bash
npm run build
# Deploy dist/ folder
```

**GitHub Pages:**
```bash
npm run build
# Deploy dist/ to gh-pages branch
```

---

## 🔌 Backend Integration

### Expected Socket.IO Events

**Client → Server:**
- `join` - Join room with `{ username, roomCode }`
- `sendMessage` - Send message `{ text, sender, timestamp, roomCode }`
- `typing` - User typing `{ username, roomCode }`
- `stopTyping` - User stopped `{ username, roomCode }`
- `leave` - Leave room `{ username, roomCode }`

**Server → Client:**
- `message` - Receive message `{ text, sender, timestamp }`
- `userCount` - User count update `(count)`
- `typing` - Someone typing `{ username }`
- `systemMessage` - System notification `{ text, isSystem: true }`

---

## 📱 Mobile-First Design

### Responsive Breakpoints

```jsx
// Mobile (default) - 320px+
px-3, py-2, text-sm, w-7, h-7

// Desktop (sm:) - 640px+
sm:px-4, sm:py-3, sm:text-base, sm:w-8, sm:h-8

// Example usage
<div className="px-3 sm:px-4 py-2 sm:py-3">
  <span className="text-sm sm:text-base">Text</span>
</div>
```

### Touch-Friendly Elements
- All buttons: 44px+ minimum tap target
- Input fields: 48px height minimum
- Icons: 20px+ with adequate padding

---

## 🎯 Key Features Explained

### 1. **Join Screen**
- Username input with real-time validation
- Room code input (uppercase auto-formatting)
- Random 6-character code generator
- Copy to clipboard with visual feedback
- Beautiful gradient buttons
- Natural error messages with emoji warnings

### 2. **Chat Interface**
- Sticky header with glassmorphism (backdrop blur)
- Room code click-to-copy
- Live user count badge
- Dark mode toggle
- Leave button (text hidden on mobile)

### 3. **Message System**
- Left-aligned bubbles for others (white bg)
- Right-aligned bubbles for you (gradient bg)
- User avatars with random colors
- Sender name display
- Timestamp on each message
- Empty state with friendly message

### 4. **Real-time Features**
- Typing indicators with animated colored dots
- Sound notification on new messages
- Auto-scroll to latest message
- System messages for join/leave events

---

## 🎓 For Interviews

### What to Say:

> "I built CodeChat as a mobile-first real-time chat app using React 19 and Socket.IO. I focused on making it feel human-designed with unique gradients, emojis, and natural language. Every component uses responsive utilities with `sm:` breakpoints, and touch targets are 44px+ for mobile accessibility."

### Technical Highlights:
- **React 19** with modern hooks (useState, useEffect, useRef)
- **Tailwind v4** with new @theme syntax
- **Socket.IO** for WebSocket real-time communication
- **Custom hooks** (useLocalStorage for persistence)
- **Mobile-first** responsive design
- **Production-ready** (~85KB gzipped)

### Design Decisions:
- Indigo-purple-pink gradient instead of generic blue
- Emojis and casual language for personality
- Backdrop blur for modern glass effect
- Different border radiuses for chat bubble feel
- Font-mono for room codes

---

## 🐛 Troubleshooting

### Connection Issues
```bash
# Check backend URL
cat .env

# Ensure backend is running
# Check browser console for Socket.IO errors
```

### Build Errors
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Dark Mode Not Working
```javascript
// Check localStorage
localStorage.getItem('darkMode')

// Clear if needed
localStorage.removeItem('darkMode')
```

---

## 📊 Build Stats

```
✓ Built in ~1.8s

CSS:  ~47 KB (gzipped: ~7.5 KB)
JS:  ~1.2 MB (gzipped: ~385 KB)

Total: ~1.25 MB (gzipped: ~393 KB)
```

**Note:** Larger due to emoji-picker and syntax-highlighter. Can be optimized with code-splitting.

---

## ✨ NEW Features Added

### 1. **Working Emoji Picker** 😀
- Click the smile icon in message input
- Beautiful emoji selector popup
- Auto-closes when clicking outside
- Instant emoji insertion

**Interview talking point:**
> "I added a working emoji picker using react-emoji-picker library. It shows on click, supports dark mode, and has proper click-outside handling with useRef and useEffect."

### 2. **Code Syntax Highlighting** 💻
- Type code blocks with \`\`\`language
- Automatic syntax highlighting
- Copy button on hover
- Supports JavaScript, Python, Java, etc.
- Line numbers for longer code

**Example usage:**
```
```javascript
const greeting = "Hello World!";
console.log(greeting);
\`\`\`
```

**Interview talking point:**
> "Perfect for 'CodeChat'! I added syntax highlighting using react-syntax-highlighter. It detects code blocks with regex, parses the language, and renders with Prism themes. There's even a copy button."

### 3. **Message Reactions** 👍❤️😂
- Double-click any message to react
- 6 quick reactions: 👍 ❤️ 😂 😮 👏 🔥
- Shows reaction counts
- Click reactions to add yours
- Smooth animations

**Interview talking point:**
> "I implemented message reactions with local state management. Double-click shows a reaction picker, and reactions are stored per message. It demonstrates handling complex nested state updates."

### 4. **Loading Skeletons** ⏳
- Beautiful shimmer effect on load
- Shows 3 message skeletons
- Better perceived performance
- Smooth transition to actual messages

**Interview talking point:**
> "Instead of a spinner, I added skeleton screens. They show the app structure while loading, making it feel faster. It's a modern UX pattern used by Facebook and LinkedIn."

---

## 🎯 Interview Power Features

You can now demonstrate:

1. **Component Composition** - CodeBlock, LoadingSkeleton as reusable components
2. **State Management** - Reactions stored in message objects
3. **Event Handling** - Double-click, click-outside with useRef
4. **Regex Parsing** - Detecting code blocks in messages
5. **Third-party Libraries** - Integrating emoji-picker and syntax-highlighter
6. **UX Patterns** - Loading states, reactions, code sharing

---

## ✨ What Makes This Special

1. ✅ **Mobile-first** (not just responsive)
2. ✅ **Unique design** (not a clone/template)
3. ✅ **Production-ready** (clean code, proper structure)
4. ✅ **Modern stack** (latest React, Tailwind v4)
5. ✅ **Human touch** (emojis, natural language)
6. ✅ **Real features** (typing indicators, sound, localStorage)
7. ✅ **Well structured** (reusable components, custom hooks)

---

## 🎉 Perfect For

- 💼 **Portfolio Projects** - Unique and impressive
- 🎤 **Job Interviews** - Production-quality code
- 📚 **Learning** - Real-time app development
- 🚀 **Production Use** - Ready to deploy
- 📝 **Resume/LinkedIn** - Strong showcase piece

---

## 📄 License

MIT License - Open source and free to use

---

## 🤝 Contributing

Contributions welcome! Feel free to:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 🌟 Show Your Support

If you like this project:
- ⭐ Star the repository
- 🐛 Report bugs
- 💡 Suggest features
- 📢 Share with others

---

**Made with ❤️ for developers by developers**

*Mobile-first • Production-ready • Interview-perfect* 🚀
