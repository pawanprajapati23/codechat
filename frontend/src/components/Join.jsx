import { useState } from 'react';
import { ArrowRight, Check, Copy, KeyRound, Lock, Mail, MessageCircle, Shuffle, User, UserPlus } from 'lucide-react';
import { generateRoomCode, copyToClipboard } from '../utils/helpers';
import { login, signup } from '../utils/api';

const Join = ({ onJoin, authUser }) => {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState(authUser?.username || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === 'signup' && !authUser;

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

    if (!authUser) {
      if (isSignup && !username.trim()) {
        newErrors.username = 'Please enter your name';
      } else if (isSignup && username.trim().length < 2) {
        newErrors.username = 'Name should be at least 2 characters';
      }

      if (!email.trim()) {
        newErrors.email = 'Email is required';
      }

      if (!password) {
        newErrors.password = 'Password is required';
      } else if (password.length < 6) {
        newErrors.password = 'Use at least 6 characters';
      }
    }

    if (!roomCode.trim()) {
      newErrors.roomCode = 'Room code is required';
    } else if (roomCode.trim().length < 4) {
      newErrors.roomCode = 'Code must be at least 4 characters';
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
      const auth = authUser
        ? { user: authUser, token: localStorage.getItem('authToken') }
        : isSignup
          ? await signup({ username: username.trim(), email: email.trim(), password })
          : await login({ email: email.trim(), password });

      onJoin({
        user: auth.user,
        token: auth.token,
        roomCode: roomCode.trim().toUpperCase(),
      });
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#efeae2] dark:bg-[#0b141a] text-gray-900 dark:text-gray-100">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col sm:max-w-xl">
        <div className="relative flex min-h-[34dvh] flex-col justify-between overflow-hidden bg-[#075e54] px-5 pb-8 pt-7 text-white dark:bg-[#111b21] sm:min-h-[300px] sm:rounded-b-[2rem]">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage:
              'radial-gradient(circle at 18% 22%, #ffffff 0 1px, transparent 1px), radial-gradient(circle at 72% 34%, #ffffff 0 1px, transparent 1px), radial-gradient(circle at 42% 72%, #ffffff 0 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }} />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">CodeChat</h1>
                <p className="text-xs font-medium text-white/75">Authenticated room messaging</p>
              </div>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
              Live
            </span>
          </div>

          <div className="relative mt-8">
            <p className="max-w-xs text-3xl font-bold leading-tight sm:text-4xl">
              Sign in and pick a room PIN.
            </p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-white/75">
              Messages sync through your account and stay available when you come back.
            </p>
          </div>
        </div>

        <div className="-mt-8 flex-1 px-3 pb-5 sm:px-5">
          <form onSubmit={handleSubmit} className="relative rounded-[1.75rem] border border-white/70 bg-white p-4 shadow-2xl dark:border-[#26343d] dark:bg-[#202c33] sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-50">
                  {authUser ? `Hi, ${authUser.username}` : isSignup ? 'Create account' : 'Welcome back'}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Enter a room PIN to continue.</p>
              </div>

              {!authUser && (
                <button
                  type="button"
                  onClick={() => {
                    setMode(isSignup ? 'login' : 'signup');
                    setErrors({});
                  }}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#f0f2f5] px-3 py-2 text-xs font-bold text-[#075e54] transition hover:bg-[#e7f7f2] dark:bg-[#111b21] dark:text-[#25d366]"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{isSignup ? 'Login' : 'Sign up'}</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              {errors.form && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                  {errors.form}
                </div>
              )}

              {!authUser && isSignup && (
                <AuthInput
                  icon={User}
                  label="Display name"
                  value={username}
                  onChange={(value) => {
                    setUsername(value);
                    setErrors({ ...errors, username: '' });
                  }}
                  error={errors.username}
                  placeholder="e.g., Pawan"
                  autoComplete="name"
                />
              )}

              {!authUser && (
                <>
                  <AuthInput
                    icon={Mail}
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(value) => {
                      setEmail(value);
                      setErrors({ ...errors, email: '' });
                    }}
                    error={errors.email}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                  <AuthInput
                    icon={Lock}
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(value) => {
                      setPassword(value);
                      setErrors({ ...errors, password: '' });
                    }}
                    error={errors.password}
                    placeholder="At least 6 characters"
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                  />
                </>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Room PIN
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <KeyRound className="h-5 w-5 text-[#128c7e] dark:text-[#25d366]" />
                  </div>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => {
                      setRoomCode(e.target.value.toUpperCase());
                      setErrors({ ...errors, roomCode: '' });
                    }}
                    placeholder="A7K9Q2"
                    className={`w-full rounded-2xl border pl-12 pr-24 py-4 bg-[#f0f2f5] dark:bg-[#111b21] ${errors.roomCode
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
                      : 'border-transparent focus:border-[#25d366] focus:ring-[#25d366]/15'
                    } font-mono text-base tracking-[0.22em] text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-4 dark:text-gray-100`}
                    maxLength={10}
                    autoComplete="off"
                    autoCapitalize="characters"
                  />
                  <div className="absolute inset-y-0 right-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      className="rounded-full p-2 text-[#54656f] transition hover:bg-white dark:text-[#aebac1] dark:hover:bg-[#202c33]"
                      aria-label="Generate room PIN"
                      title="Generate room PIN"
                    >
                      <Shuffle className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      disabled={!roomCode}
                      className={`rounded-full p-2 transition ${roomCode ? 'text-[#128c7e] hover:bg-white dark:text-[#25d366] dark:hover:bg-[#202c33]' : 'text-gray-300 dark:text-gray-600'}`}
                      aria-label={copied ? 'Room PIN copied' : 'Copy room PIN'}
                      title={copied ? 'Copied' : 'Copy room PIN'}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {errors.roomCode && (
                  <p className="mt-1.5 text-sm text-red-500">
                    {errors.roomCode}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#00a884] px-6 py-4 text-base font-bold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-[#008f72] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span>{isSubmitting ? 'Please wait...' : 'Continue'}</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </form>

          <div className="mt-4 rounded-2xl bg-white/60 px-4 py-3 text-center text-xs font-medium text-gray-500 dark:bg-[#111b21]/70 dark:text-gray-400">
            Share the same PIN with friends to enter one room.
          </div>
        </div>
      </div>
    </div>
  );
};

const AuthInput = ({ icon: Icon, label, value, onChange, error, type = 'text', placeholder, autoComplete }) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <Icon className="h-5 w-5 text-[#128c7e] dark:text-[#25d366]" />
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-2xl border pl-12 pr-4 py-4 bg-[#f0f2f5] dark:bg-[#111b21] ${error
          ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
          : 'border-transparent focus:border-[#25d366] focus:ring-[#25d366]/15'
        } text-base text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-4 dark:text-gray-100`}
        autoComplete={autoComplete}
      />
    </div>
    {error && (
      <p className="mt-1.5 text-sm text-red-500">
        {error}
      </p>
    )}
  </div>
);

export default Join;
