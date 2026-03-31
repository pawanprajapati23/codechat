import { useState } from 'react';
import { Users, Hash, Copy, Check, Shuffle, LogIn } from 'lucide-react';
import { generateRoomCode, copyToClipboard } from '../utils/helpers';

const Join = ({ onJoin }) => {
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState({});

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

    if (!username.trim()) {
      newErrors.username = 'Please enter your name';
    } else if (username.trim().length < 2) {
      newErrors.username = 'Name should be at least 2 characters';
    } else if (username.trim().length > 20) {
      newErrors.username = 'Name is too long (max 20 characters)';
    }

    if (!roomCode.trim()) {
      newErrors.roomCode = 'Room code is required';
    } else if (roomCode.trim().length < 4) {
      newErrors.roomCode = 'Code must be at least 4 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onJoin({
        username: username.trim(),
        roomCode: roomCode.trim().toUpperCase(),
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-md px-2 sm:px-0">
        {/* Logo & Title */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl sm:rounded-3xl mb-3 sm:mb-4 shadow-lg transform hover:scale-105 transition-transform">
            <Users className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
            CodeChat
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Chat anonymously in real-time
          </p>
        </div>

        {/* Join Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-8 space-y-4 sm:space-y-5 border border-gray-100 dark:border-gray-700">
          {/* Username Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Your Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <Users className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrors({ ...errors, username: '' });
                }}
                placeholder="e.g., Pawan"
                className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 bg-gray-50 dark:bg-gray-700/50 border-2 ${errors.username
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400'
                  } rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 text-base`}
                maxLength={20}
                autoComplete="off"
              />
            </div>
            {errors.username && (
              <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                <span className="text-xs">⚠️</span> {errors.username}
              </p>
            )}
          </div>

          {/* Room Code Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Room Code
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <Hash className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value.toUpperCase());
                  setErrors({ ...errors, roomCode: '' });
                }}
                placeholder="ABC123"
                className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 bg-gray-50 dark:bg-gray-700/50 border-2 ${errors.roomCode
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-gray-200 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400'
                  } rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/10 transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 uppercase font-mono text-base tracking-wider`}
                maxLength={10}
                autoComplete="off"
              />
            </div>
            {errors.roomCode && (
              <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                <span className="text-xs">⚠️</span> {errors.roomCode}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleGenerateCode}
              className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-medium transition-all hover:shadow-lg active:scale-95 text-sm sm:text-base"
            >
              <Shuffle className="w-4 h-4" />
              <span>Generate</span>
            </button>

            <button
              type="button"
              onClick={handleCopyCode}
              disabled={!roomCode}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl font-medium transition-all text-sm sm:text-base ${roomCode
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white hover:shadow-lg active:scale-95'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Join Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl active:scale-98 text-base sm:text-lg"
          >
            <LogIn className="w-5 h-5" />
            <span>Join Chat Room</span>
          </button>
        </form>

        {/* Footer */}
        <div className="mt-5 sm:mt-6 text-center">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 px-4">
            💡 Share the code with friends to chat together
          </p>
        </div>
      </div>
    </div>
  );
};

export default Join;
