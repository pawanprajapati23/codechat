import { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';

const ShareRoom = ({ roomCode }) => {
  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const roomUrl = `${window.location.origin}?room=${roomCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = roomUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my CodeChat room!',
          text: `Join me in room ${roomCode}`,
          url: roomUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowShare(!showShare)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Share room"
      >
        <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

      {showShare && (
        <div className="absolute top-12 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 min-w-[280px] z-50">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
            Share Room
          </h3>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Room Code</p>
            <p className="text-sm font-mono font-bold text-gray-800 dark:text-gray-100">
              {roomCode}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500 dark:text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  <span className="text-sm text-gray-700 dark:text-gray-200">Copy Link</span>
                </>
              )}
            </button>

            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm">Share</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareRoom;
