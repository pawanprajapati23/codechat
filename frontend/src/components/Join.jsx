import { useState } from 'react';
import { ArrowRight, Check, Copy, KeyRound, Lock, Mail, MessageCircle, Shuffle, User, X } from 'lucide-react';
import { generateRoomCode, copyToClipboard } from '../utils/helpers';
import { login, signup } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const Join = ({ onJoin, authUser }) => {
  const [mode, setMode] = useState('guest'); // guest, login, signup
  const [username, setUsername] = useState(authUser?.username || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGenerateCode = () => {
    const newCode = generateRoomCode();
    setRoomCode(newCode);
    setErrors({ ...errors, roomCode: '' });
  };

  const handleCopyCode = async () => {
    if (!roomCode) return;
    const success = await copyToClipboard(roomCode);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (mode === 'guest' && !authUser) {
      if (!username.trim()) newErrors.username = 'Please enter your name';
    }

    if (mode === 'signup' || mode === 'login') {
      if (mode === 'signup' && !username.trim()) newErrors.username = 'Please enter your name';
      if (!email.trim()) newErrors.email = 'Email is required';
      if (!password) newErrors.password = 'Password is required';
    }

    if (mode === 'guest' || authUser) {
      if (!roomCode.trim()) newErrors.roomCode = 'Room code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      if (mode === 'guest' && !authUser) {
        onJoin({
          user: { username: username.trim(), isGuest: true },
          token: null,
          roomCode: roomCode.trim().toUpperCase(),
        });
      } else if (authUser) {
        onJoin({
          user: authUser,
          token: localStorage.getItem('authToken'),
          roomCode: roomCode.trim().toUpperCase(),
        });
      } else {
        const auth = mode === 'signup' 
          ? await signup({ username: username.trim(), email: email.trim(), password })
          : await login({ email: email.trim(), password });
        
        localStorage.setItem('authToken', auth.token);
        window.location.reload(); 
      }
    } catch (error) {
      setErrors({ form: error.message || 'Authentication failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAuth = (authMode) => {
    setMode(authMode);
    setErrors({});
  };

  const closeAuth = () => {
    setMode('guest');
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-[#efeae2] dark:bg-[#0b141a] flex items-center justify-center p-4 font-sans transition-colors">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-[#111b21] rounded-3xl shadow-2xl border border-gray-200 dark:border-[#202c33] overflow-hidden transition-colors"
      >
        <div className="p-8 text-center text-gray-800 dark:text-[#e9edef]">
          <div className="flex justify-center mb-4">
            <div className="bg-gray-100 dark:bg-[#202c33] p-4 rounded-full shadow-inner transition-colors">
              <MessageCircle size={40} className="text-[#00a884]" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-gray-900 dark:text-white">CodeChat</h1>
          <p className="text-gray-500 dark:text-[#8696a0] text-sm mb-6">Real-time messaging, redefined.</p>

          {authUser ? (
            <div className="bg-gray-50 dark:bg-[#202c33] rounded-2xl p-4 mb-6 border border-gray-200 dark:border-[#2a3942] transition-colors">
              <p className="font-semibold text-lg text-gray-900 dark:text-[#e9edef]">Welcome back, {authUser.username}!</p>
              <p className="text-xs text-gray-500 dark:text-[#8696a0]">Enter a Room PIN to join</p>
            </div>
          ) : (
            <div className="flex gap-4 justify-center mb-8">
              <button 
                onClick={() => openAuth('login')}
                className="px-6 py-2 rounded-full bg-gray-100 dark:bg-[#202c33] hover:bg-gray-200 dark:hover:bg-[#2a3942] text-gray-800 dark:text-[#e9edef] transition-colors border border-gray-200 dark:border-[#2a3942] font-semibold"
              >
                Login
              </button>
              <button 
                onClick={() => openAuth('signup')}
                className="px-6 py-2 rounded-full bg-[#00a884] text-white dark:text-[#111b21] hover:bg-[#008f72] transition-colors font-semibold shadow-lg"
              >
                Sign Up
              </button>
            </div>
          )}

          {(!authUser && mode === 'guest') && (
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px flex-1 bg-gray-300 dark:bg-[#2a3942] transition-colors"></div>
              <span className="text-gray-400 dark:text-[#8696a0] text-xs font-bold uppercase tracking-wider">OR CONTINUE AS GUEST</span>
              <div className="h-px flex-1 bg-gray-300 dark:bg-[#2a3942] transition-colors"></div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {(!authUser && mode === 'guest') && (
              <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-[#8696a0] ml-1 mb-1 block">Display Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#8696a0] h-5 w-5" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setErrors({ ...errors, username: '' }); }}
                    className="w-full bg-gray-50 dark:bg-[#202c33] border border-gray-200 dark:border-[#2a3942] rounded-2xl py-3 pl-12 pr-4 text-gray-900 dark:text-[#e9edef] placeholder-gray-400 dark:placeholder-[#8696a0] focus:outline-none focus:ring-1 focus:ring-[#00a884] transition-colors"
                    placeholder="Enter your name"
                  />
                </div>
                {errors.username && <p className="text-red-500 dark:text-red-400 text-xs mt-1 ml-1">{errors.username}</p>}
              </div>
            )}

            {mode === 'guest' && (
              <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-[#8696a0] ml-1 mb-1 block">Room PIN</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#8696a0] h-5 w-5" />
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => { setRoomCode(e.target.value.toUpperCase()); setErrors({ ...errors, roomCode: '' }); }}
                    className="w-full bg-gray-50 dark:bg-[#202c33] border border-gray-200 dark:border-[#2a3942] rounded-2xl py-3 pl-12 pr-24 text-gray-900 dark:text-[#e9edef] placeholder-gray-400 dark:placeholder-[#8696a0] focus:outline-none focus:ring-1 focus:ring-[#00a884] transition-colors font-mono tracking-widest uppercase"
                    placeholder="e.g. A7K9Q2"
                    maxLength={10}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-[#2a3942] text-gray-500 dark:text-[#8696a0] transition-colors"
                      title="Generate PIN"
                    >
                      <Shuffle size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      disabled={!roomCode}
                      className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-[#2a3942] text-gray-500 dark:text-[#8696a0] transition-colors disabled:opacity-50"
                      title="Copy PIN"
                    >
                      {copied ? <Check size={16} className="text-[#00a884]" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
                {errors.roomCode && <p className="text-red-500 dark:text-red-400 text-xs mt-1 ml-1">{errors.roomCode}</p>}
              </div>
            )}

            {mode === 'guest' && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-[#00a884] text-white dark:text-[#111b21] font-bold text-lg shadow-xl hover:bg-[#008f72] active:scale-[0.98] transition-colors flex items-center justify-center gap-2 mt-6"
              >
                {isSubmitting ? 'Joining...' : (authUser ? 'Join Room' : 'Join as Guest')}
                <ArrowRight size={20} />
              </button>
            )}
          </form>
        </div>
      </motion.div>

      {/* Auth Modal using Framer Motion */}
      <AnimatePresence>
        {(mode === 'login' || mode === 'signup') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-colors"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#111b21] rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-gray-200 dark:border-[#2a3942] relative transition-colors"
            >
              <button onClick={closeAuth} className="absolute top-4 right-4 text-gray-400 dark:text-[#8696a0] hover:text-gray-800 dark:hover:text-[#e9edef] transition-colors">
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-[#e9edef] mb-6 text-center">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {errors.form && (
                  <div className="p-3 rounded-xl bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm text-center transition-colors">
                    {errors.form}
                  </div>
                )}

                {mode === 'signup' && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600 dark:text-[#8696a0] block mb-1">Display Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#8696a0] h-5 w-5" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-[#202c33] border border-gray-200 dark:border-[#2a3942] rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-[#e9edef] placeholder-gray-400 dark:placeholder-[#8696a0] focus:border-[#00a884] focus:outline-none focus:ring-1 focus:ring-[#00a884] transition-colors"
                        placeholder="John Doe"
                      />
                    </div>
                    {errors.username && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.username}</p>}
                  </div>
                )}

                <div>
                  <label className="text-sm font-semibold text-gray-600 dark:text-[#8696a0] block mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#8696a0] h-5 w-5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-[#202c33] border border-gray-200 dark:border-[#2a3942] rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-[#e9edef] placeholder-gray-400 dark:placeholder-[#8696a0] focus:border-[#00a884] focus:outline-none focus:ring-1 focus:ring-[#00a884] transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600 dark:text-[#8696a0] block mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#8696a0] h-5 w-5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-[#202c33] border border-gray-200 dark:border-[#2a3942] rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-[#e9edef] placeholder-gray-400 dark:placeholder-[#8696a0] focus:border-[#00a884] focus:outline-none focus:ring-1 focus:ring-[#00a884] transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.password}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-[#00a884] hover:bg-[#008f72] text-white dark:text-[#111b21] font-bold text-lg shadow-lg transition-colors mt-4"
                >
                  {isSubmitting ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-600 dark:text-[#8696a0]">
                {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => openAuth(mode === 'login' ? 'signup' : 'login')}
                  className="text-[#00a884] hover:text-[#008f72] dark:hover:text-[#25d366] font-semibold transition-colors"
                >
                  {mode === 'login' ? 'Sign up' : 'Login'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Join;
