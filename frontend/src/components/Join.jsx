import { useState, useEffect } from 'react';
import { ArrowRight, Check, Copy, KeyRound, Lock, Mail, MessageCircle, Shuffle, User, X, ShieldQuestion, Sparkles } from 'lucide-react';
import { generateRoomCode, copyToClipboard } from '../utils/helpers';
import { login, signup, forgotPassword, resetPassword } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const Join = ({ onJoin, authUser }) => {
  const [mode, setMode] = useState('guest'); // guest, login, signup, forgot
  const [username, setUsername] = useState(authUser?.username || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);

  useEffect(() => {
    // Focus username input on mount if guest
    if (mode === 'guest' && !authUser) {
      document.getElementById('username-input')?.focus();
    }
  }, [mode, authUser]);

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

    if (mode === 'forgot') {
      if (!email.trim()) newErrors.email = 'Email is required';
      if (forgotPasswordStep === 2) {
        if (!resetCode.trim()) newErrors.resetCode = 'Reset code is required';
        if (!password) newErrors.password = 'New password is required';
      }
    }

    if ((mode === 'guest' || authUser) && mode !== 'forgot' && mode !== 'login' && mode !== 'signup') {
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
      } else if (mode === 'forgot') {
        if (forgotPasswordStep === 1) {
          const res = await forgotPassword({ email: email.trim() });
          alert(res.message);
          setForgotPasswordStep(2);
        } else {
          await resetPassword({ email: email.trim(), code: resetCode.trim(), newPassword: password });
          setMode('login');
          setForgotPasswordStep(1);
          setResetCode('');
          setPassword('');
          alert('Password reset successfully. Please login.');
        }
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 flex items-center justify-center p-4 font-sans transition-colors relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-purple-400/20 dark:bg-purple-600/10 blur-[80px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-indigo-400/20 dark:bg-indigo-600/10 blur-[80px]"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
        className="w-full max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.4)] border border-white/50 dark:border-gray-700/50 overflow-hidden relative z-10"
      >
        <div className="p-8 text-center text-gray-800 dark:text-gray-100">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-4 rounded-2xl shadow-lg shadow-indigo-500/30 text-white relative group">
              <MessageCircle size={36} className="relative z-10 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </motion.div>
          
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">CodeChat</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 font-medium">Lightning fast, perfectly smooth.</p>

          {authUser ? (
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-5 mb-8 border border-indigo-100 dark:border-gray-700/50 backdrop-blur-sm">
              <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">Welcome back, <span className="text-indigo-600 dark:text-indigo-400">{authUser.username}</span>!</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Enter a Room PIN to connect instantly</p>
            </div>
          ) : (
            <div className="flex gap-3 justify-center mb-8">
              <button 
                type="button"
                onClick={() => openAuth('login')}
                className="flex-1 py-2.5 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-all border border-gray-200 dark:border-gray-700 font-semibold shadow-sm hover:shadow-md"
              >
                Login
              </button>
              <button 
                type="button"
                onClick={() => openAuth('signup')}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-all font-semibold shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40"
              >
                Sign Up
              </button>
            </div>
          )}

          {(!authUser && mode === 'guest') && (
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
              <span className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest">Stranger Chat</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            {(!authUser && mode === 'guest') && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 ml-1 mb-1.5 block uppercase tracking-wide">Your Name</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition-opacity"></div>
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 h-5 w-5 transition-colors z-10" />
                  <input
                    id="username-input"
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setErrors({ ...errors, username: '' }); }}
                    className="relative w-full bg-gray-50/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl py-3.5 pl-12 pr-4 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500/50 transition-all z-10"
                    placeholder="What should we call you?"
                  />
                </div>
                {errors.username && <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 ml-1 flex items-center gap-1"><X size={12}/>{errors.username}</p>}
              </motion.div>
            )}

            {mode === 'guest' && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <div className="flex justify-between items-end mb-1.5 ml-1">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Room PIN</label>
                  <button 
                    type="button" 
                    onClick={handleGenerateCode}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
                  >
                    <Sparkles size={12} /> Auto-generate
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-0 group-focus-within:opacity-20 transition-opacity"></div>
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 h-5 w-5 transition-colors z-10" />
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => { setRoomCode(e.target.value.toUpperCase()); setErrors({ ...errors, roomCode: '' }); }}
                    className="relative w-full bg-gray-50/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl py-3.5 pl-12 pr-24 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500/50 transition-all font-mono tracking-widest uppercase z-10"
                    placeholder="Enter PIN"
                    maxLength={10}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 z-20">
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      disabled={!roomCode}
                      className="p-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 text-gray-500 dark:text-gray-400 transition-colors disabled:opacity-30"
                      title="Copy PIN"
                    >
                      {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
                {errors.roomCode && <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 ml-1 flex items-center gap-1"><X size={12}/>{errors.roomCode}</p>}
              </motion.div>
            )}

            {mode === 'guest' && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-lg shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-8 group"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">Connecting...</span>
                ) : (
                  <>
                    {authUser ? 'Join Room' : 'Connect instantly'}
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            )}
          </form>
        </div>
      </motion.div>

      {/* Auth Modal using Framer Motion */}
      <AnimatePresence>
        {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-md transition-colors"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-[2rem] w-full max-w-sm p-8 shadow-2xl border border-white/50 dark:border-gray-700/50 relative max-h-[90vh] overflow-y-auto"
            >
              <button onClick={closeAuth} className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                <X size={20} />
              </button>
              
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {mode === 'login' ? 'Welcome Back' : mode === 'forgot' ? 'Reset Password' : 'Create Account'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {mode === 'login' ? 'Enter your details to access your chats.' : mode === 'forgot' ? 'We will send a 6-digit code to your email.' : 'Join the conversation today.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {errors.form && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
                    <X size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{errors.form}</span>
                  </motion.div>
                )}

                {mode === 'signup' && (
                  <div>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-12 pr-4 text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        placeholder="Display Name"
                      />
                    </div>
                    {errors.username && <p className="text-red-500 text-xs mt-1 ml-1">{errors.username}</p>}
                  </div>
                )}

                {(mode !== 'forgot' || (mode === 'forgot' && forgotPasswordStep === 1)) && (
                  <div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-12 pr-4 text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        placeholder="Email Address"
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
                  </div>
                )}

                {(mode !== 'forgot' || (mode === 'forgot' && forgotPasswordStep === 2)) && (
                  <div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-12 pr-4 text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        placeholder={mode === 'forgot' ? 'New Password' : 'Password'}
                      />
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>}
                    {mode === 'login' && (
                      <div className="flex justify-end mt-2">
                        <button
                          type="button"
                          onClick={() => { openAuth('forgot'); setForgotPasswordStep(1); }}
                          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {(mode === 'forgot' && forgotPasswordStep === 2) && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                      <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">Enter Reset Code</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Check your email for the 6-digit code we just sent.</p>
                    </div>

                    <div>
                      <div className="relative">
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="text"
                          value={resetCode}
                          onChange={(e) => setResetCode(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-12 pr-4 text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono tracking-widest uppercase"
                          placeholder="6-DIGIT CODE"
                          maxLength={6}
                        />
                      </div>
                      {errors.resetCode && <p className="text-red-500 text-xs mt-1 ml-1">{errors.resetCode}</p>}
                    </div>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-lg shadow-lg shadow-indigo-500/25 transition-all mt-6 active:scale-[0.98]"
                >
                  {isSubmitting ? 'Please wait...' : (mode === 'login' ? 'Sign In' : mode === 'forgot' ? (forgotPasswordStep === 1 ? 'Send Reset Code' : 'Reset Password') : 'Create Account')}
                </button>
              </form>

              <div className="mt-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                {mode === 'login' ? "Don't have an account? " : mode === 'forgot' ? "Remember your password? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => openAuth(mode === 'login' ? 'signup' : 'login')}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold transition-colors ml-1"
                >
                  {mode === 'login' ? 'Sign up' : 'Log in'}
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

