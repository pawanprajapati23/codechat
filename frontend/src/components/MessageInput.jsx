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
    if (e.target && e.target.querySelector('input[type="text"]')) {
      setTimeout(() => {
        e.target.querySelector('input[type="text"]').focus();
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
    <form onSubmit={handleSubmit} className="bg-[#f0f2f5] dark:bg-[#202c33] border-t border-gray-200 dark:border-[#2a3942] px-3 sm:px-4 py-3 sm:py-4 shadow-lg shrink-0 transition-colors">
      <div className="max-w-4xl mx-auto relative">
        {replyingTo && (
          <div className="mb-2 flex items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-[#2a3942] bg-gray-50 dark:bg-[#111b21] px-3 py-2 border-l-4 border-l-[#25d366]">
            <div className="min-w-0 flex items-center gap-2">
              <Reply className="w-4 h-4 text-[#25d366] flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#25d366] truncate">{replyingTo.sender}</span>
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
          <div className="mb-2 flex items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-[#2a3942] bg-gray-50 dark:bg-[#111b21] px-3 py-2">
            <div className="min-w-0 flex items-center gap-2">
              {attachment?.type?.startsWith('image/') ? (
                <ImagePlus className="w-4 h-4 text-[#25d366] flex-shrink-0" />
              ) : (
                <Paperclip className="w-4 h-4 text-[#25d366] flex-shrink-0" />
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
            className="p-3 sm:p-3.5 rounded-full bg-transparent text-[#54656f] dark:text-[#8696a0] hover:bg-gray-200 dark:hover:bg-[#2a3942] transition-all active:scale-95"
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
            className="w-full px-4 sm:px-5 py-3 sm:py-3.5 pr-11 sm:pr-12 bg-white dark:bg-[#2a3942] text-gray-800 dark:text-[#d1d7db] rounded-full focus:outline-none focus:ring-1 focus:ring-[#25d366] transition-all placeholder-gray-400 dark:placeholder-[#8696a0] text-sm sm:text-base"
            autoComplete="off"
            autoFocus
          />
          
          {/* Emoji Button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 transition-colors ${
              showEmojiPicker 
                ? 'text-[#128c7e] dark:text-[#25d366]'
                : 'text-gray-400 dark:text-[#8696a0] hover:text-[#128c7e] dark:hover:text-[#25d366]'
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
              ? 'bg-[#00a884] dark:bg-[#25d366] text-white dark:text-[#111b21] hover:shadow-lg active:scale-95 hover:bg-[#008f72] dark:hover:bg-[#20c05c]'
              : 'bg-gray-200 dark:bg-[#2a3942] text-gray-400 dark:text-[#8696a0] cursor-not-allowed'
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
