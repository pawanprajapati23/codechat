import { useState } from 'react';
import { Check, Copy, LogOut, Phone, Users, Video, Menu, MonitorUp } from 'lucide-react';
import { copyToClipboard } from '../utils/helpers';
import ShareRoom from './ShareRoom';

const Header = ({ roomCode, userCount, onLeave, onStartCall, onOpenSidebar, showSidebarBtn }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(roomCode);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-indigo-100 dark:border-gray-800 px-3 sm:px-4 py-3 sm:py-3.5 shadow-sm sticky top-0 z-50 transition-colors">
      <div className="flex items-center justify-between w-full mx-auto">
        {/* Left: Room Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          {showSidebarBtn && (
            <button 
              onClick={onOpenSidebar}
              className="p-1.5 sm:p-2 text-white hover:bg-white/10 rounded-lg md:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
          <div className="bg-indigo-50/50 dark:bg-gray-800 text-indigo-700 dark:text-indigo-300 rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:bg-indigo-100 dark:hover:bg-gray-700 transition-all active:scale-95 border border-indigo-100 dark:border-gray-700"
               onClick={handleCopy}>
            <span className="font-bold text-xs sm:text-sm font-mono tracking-wider">{roomCode}</span>
            {copied ? (
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </div>
          
          <div className="flex items-center gap-1 sm:gap-1.5 bg-indigo-50/50 dark:bg-gray-800 border border-indigo-100 dark:border-gray-700 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500 dark:text-indigo-400" />
            <span className="text-xs sm:text-sm font-semibold text-indigo-700 dark:text-indigo-300">{userCount}</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => onStartCall('audio')}
            className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl hover:bg-indigo-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all active:scale-95"
            aria-label="Start audio call"
            title="Start audio call"
          >
            <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={() => onStartCall('video')}
            className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl hover:bg-indigo-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all active:scale-95"
            aria-label="Start video call"
            title="Start video call"
          >
            <Video className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={() => onStartCall('screen')}
            className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl hover:bg-indigo-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all active:scale-95"
            aria-label="Share screen"
            title="Share screen"
          >
            <MonitorUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Share Room */}
          <ShareRoom roomCode={roomCode} />
          
          {/* Leave Button */}
          <button
            onClick={onLeave}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white rounded-lg sm:rounded-xl transition-all active:scale-95 border border-red-100 dark:border-red-500/20"
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
