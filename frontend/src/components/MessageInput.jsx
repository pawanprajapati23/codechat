import { useState, useRef, useEffect } from 'react';
import { ImagePlus, Paperclip, Send, Smile, X, Reply } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

const MAX_ATTACHMENT_SIZE = 4 * 1024 * 1024;

const MessageInput = ({ onSendMessage, onSendAttachment, onTyping, replyingTo, onCancelReply }) => {
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
    <form onSubmit={handleSubmit} className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-t border-indigo-50 dark:border-gray-800 px-3 sm:px-4 py-3 sm:py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.2)] shrink-0 transition-colors z-20">
      <div className="max-w-4xl mx-auto relative">
        {replyingTo && (
          <div className="mb-2 flex items-center justify-between gap-3 rounded-xl border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/50 dark:bg-indigo-900/10 px-3 py-2 border-l-4 border-l-indigo-500 backdrop-blur-sm">
            <div className="min-w-0 flex items-center gap-2">
              <Reply className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate">{replyingTo.sender}</span>
                <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {replyingTo.text || (replyingTo.attachment ? 'Attachment' : 'Message')}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onCancelReply}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {(attachment || fileError) && (
          <div className="mb-2 flex items-center justify-between gap-3 rounded-xl border border-indigo-100 dark:border-gray-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-3 py-2 shadow-sm">
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
            className="p-3 sm:p-3.5 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all active:scale-95"
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
            placeholder="Type a message"
            className="w-full px-4 sm:px-5 py-3 sm:py-3.5 pr-11 sm:pr-12 bg-white/90 dark:bg-gray-800/90 shadow-inner border border-gray-200/50 dark:border-gray-700/50 text-gray-800 dark:text-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder-gray-400 text-sm sm:text-base backdrop-blur-sm"
            autoComplete="off"
            autoFocus
          />
          
          {/* Emoji Button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 transition-colors ${
              showEmojiPicker 
                ? 'text-indigo-500 dark:text-indigo-400'
                : 'text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400'
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
          className={`p-3 sm:p-3.5 rounded-full transition-all shadow-sm flex items-center justify-center ${
            canSend
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40 active:scale-95'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
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
