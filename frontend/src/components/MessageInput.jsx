import { useState, useRef, useEffect } from 'react';
import { ImagePlus, Paperclip, Send, Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

const MAX_ATTACHMENT_SIZE = 4 * 1024 * 1024;

const MessageInput = ({ onSendMessage, onSendAttachment, onTyping }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [fileError, setFileError] = useState('');
  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef(null);

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

    if (attachment) {
      onSendAttachment(attachment, message.trim());
      setAttachment(null);
      setMessage('');
    } else if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    } else {
      return;
    }

    // Keep focus on input (prevent keyboard from hiding on mobile)
    if (e.target && e.target.querySelector('input')) {
      setTimeout(() => {
        e.target.querySelector('input').focus();
      }, 10);
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    setFileError('');

    if (!file) return;

    const isAllowedType = file.type.startsWith('image/') || file.type === 'application/pdf';
    if (!isAllowedType) {
      setFileError('Choose an image or PDF file.');
      return;
    }

    if (file.size > MAX_ATTACHMENT_SIZE) {
      setFileError('Files must be 4 MB or smaller.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: reader.result,
      });
    };
    reader.onerror = () => setFileError('Could not read that file.');
    reader.readAsDataURL(file);
  };

  const canSend = message.trim() || attachment;

  return (
    <form onSubmit={handleSubmit} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-3 sm:py-4 shadow-lg shrink-0">
      <div className="max-w-4xl mx-auto relative">
        {(attachment || fileError) && (
          <div className="mb-2 flex items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 px-3 py-2">
            <div className="min-w-0 flex items-center gap-2">
              {attachment?.type?.startsWith('image/') ? (
                <ImagePlus className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              ) : (
                <Paperclip className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              )}
              <span className={`truncate text-xs sm:text-sm ${fileError ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-200'}`}>
                {fileError || attachment.name}
              </span>
            </div>
            {attachment && (
              <button
                type="button"
                onClick={() => setAttachment(null)}
                className="text-xs font-semibold text-gray-500 hover:text-red-500"
              >
                Remove
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 sm:p-3.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95"
            aria-label="Attach image or PDF"
            title="Attach image or PDF"
          >
            <Paperclip className="w-5 h-5" />
          </button>

        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="w-full px-4 sm:px-5 py-3 sm:py-3.5 pr-11 sm:pr-12 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-full sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-base"
            autoComplete="off"
            autoFocus
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
          disabled={!canSend}
          className={`p-3 sm:p-3.5 rounded-full transition-all ${
            canSend
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
      </div>
    </form>
  );
};

export default MessageInput;
