import { useState } from 'react';
import { Moon, Sun, Users, Copy, Check, LogOut } from 'lucide-react';
import { copyToClipboard } from '../utils/helpers';

const Header = ({ roomCode, userCount, onLeave, darkMode, toggleDarkMode }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(roomCode);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-3 sm:py-3.5 shadow-sm sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {/* Left: Room Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:shadow-lg transition-all active:scale-95"
               onClick={handleCopy}>
            <span className="font-bold text-xs sm:text-sm font-mono tracking-wider">{roomCode}</span>
            {copied ? (
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </div>
          
          <div className="flex items-center gap-1 sm:gap-1.5 bg-gray-100 dark:bg-gray-700/50 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">{userCount}</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-95"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            )}
          </button>

          {/* Leave Button */}
          <button
            onClick={onLeave}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg sm:rounded-xl transition-all hover:shadow-lg active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-semibold hidden sm:inline">Leave</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
