import { useState, useRef, useEffect } from 'react';
import { Send, Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

const MessageInput = ({ onSendMessage, onTyping }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    onTyping();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-3 sm:py-4 shadow-lg sticky bottom-0">
      <div className="flex items-center gap-2 sm:gap-3 max-w-4xl mx-auto relative">
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="w-full px-4 sm:px-5 py-3 sm:py-3.5 pr-11 sm:pr-12 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-full sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-base"
            autoComplete="off"
          />
          
          {/* Emoji Button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 transition-colors ${
              showEmojiPicker 
                ? 'text-purple-500 dark:text-purple-400' 
                : 'text-gray-400 hover:text-purple-500 dark:hover:text-purple-400'
            }`}
            aria-label="Add emoji"
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim()}
          className={`p-3 sm:p-3.5 rounded-full transition-all ${
            message.trim()
              ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:shadow-lg active:scale-95 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
          }`}
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>

        {/* Emoji Picker Popup */}
        {showEmojiPicker && (
          <div ref={emojiPickerRef} className="absolute bottom-full right-0 mb-2 z-50">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme="auto"
              width={300}
              height={400}
              previewConfig={{ showPreview: false }}
            />
          </div>
        )}
      </div>
    </form>
  );
};

export default MessageInput;
