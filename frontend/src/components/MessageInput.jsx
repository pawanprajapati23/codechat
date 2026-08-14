import { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, Smile, X, Reply, FileText, ImagePlus } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

// 10 MB max (base64 overhead ~33% so effective ~7.5 MB raw)
const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

// Human-readable file size
const fmtSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getFileIcon = (type) => {
  if (!type) return <FileText className="w-4 h-4 text-[#25d366] flex-shrink-0" />;
  if (type.startsWith('image/')) return <ImagePlus className="w-4 h-4 text-[#25d366] flex-shrink-0" />;
  return <Paperclip className="w-4 h-4 text-[#25d366] flex-shrink-0" />;
};

const MessageInput = ({ onSendMessage, onSendAttachment, onTyping, replyingTo, onCancelReply }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [fileError, setFileError] = useState('');
  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-resize textarea as user types
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    // Max ~6 lines
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  }, [message]);

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

  const doSend = () => {
    if (attachment) {
      onSendAttachment(attachment, message);   // preserve full formatting in caption
      setAttachment(null);
      setMessage('');
    } else if (message.trim()) {
      onSendMessage(message);                  // send with all whitespace intact
      setMessage('');
    }
    // Re-focus textarea
    setTimeout(() => textareaRef.current?.focus(), 10);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    doSend();
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    onTyping();
  };

  // Enter sends, Shift+Enter adds newline (standard messaging UX)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      doSend();
    }
  };

  const handleEmojiClick = (emojiData) => {
    const ta = textareaRef.current;
    if (ta) {
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = message.slice(0, start) + emojiData.emoji + message.slice(end);
      setMessage(newVal);
      // Restore cursor after emoji
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = start + emojiData.emoji.length;
        ta.focus();
      }, 0);
    } else {
      setMessage((prev) => prev + emojiData.emoji);
    }
    setShowEmojiPicker(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    setFileError('');

    if (!file) return;

    if (file.size > MAX_ATTACHMENT_SIZE) {
      setFileError(`File too large. Max size is ${fmtSize(MAX_ATTACHMENT_SIZE)}.`);
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
    reader.onerror = () => setFileError('Could not read that file. Please try again.');
    reader.readAsDataURL(file);
  };

  const canSend = message.trim() || attachment;

  return (
    <form onSubmit={handleSubmit} className="bg-transparent border-none px-2 py-2 shrink-0 transition-colors z-20 w-full pb-3 sm:pb-4">
      <div className="max-w-4xl mx-auto relative">

        {/* Reply preview */}
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

        {/* Attachment / error preview */}
        {(attachment || fileError) && (
          <div className="mb-2 flex items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-[#2a3942] bg-gray-50 dark:bg-[#111b21] px-3 py-2">
            <div className="min-w-0 flex items-center gap-2">
              {attachment ? getFileIcon(attachment.type) : <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />}
              <div className="flex flex-col min-w-0">
                {fileError ? (
                  <span className="truncate text-xs text-red-600 dark:text-red-400">{fileError}</span>
                ) : (
                  <>
                    <span className="truncate text-xs sm:text-sm text-gray-700 dark:text-gray-200 font-medium">{attachment.name}</span>
                    <span className="text-[10px] text-gray-400">{fmtSize(attachment.size)}</span>
                  </>
                )}
              </div>
            </div>
            {attachment && (
              <button
                type="button"
                onClick={() => { setAttachment(null); setFileError(''); }}
                className="text-xs font-semibold text-gray-500 hover:text-red-500 transition-colors flex-shrink-0"
              >
                Remove
              </button>
            )}
          </div>
        )}

        <div className="flex items-end gap-1.5 sm:gap-2">
          {/* Hidden file input — accept ALL file types */}
          <input
            ref={fileInputRef}
            type="file"
            accept="*/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Main input bar */}
          <div className="flex-1 relative flex items-end bg-white dark:bg-[#2a3942] rounded-2xl shadow-sm border border-transparent dark:border-transparent">
            {/* Emoji Button (Left) */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-2 ml-1 mb-1 transition-colors flex-shrink-0 ${
                showEmojiPicker
                  ? 'text-[#128c7e] dark:text-[#25d366]'
                  : 'text-[#8696a0] hover:text-[#128c7e] dark:hover:text-[#25d366]'
              }`}
              aria-label="Add emoji"
            >
              <Smile className="w-6 h-6" />
            </button>

            {/*
              Textarea replaces the old <input type="text">
              - Preserves newlines, spaces, indentation on paste
              - Shift+Enter = new line | Enter = send
              - Auto-grows up to ~6 lines
            */}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Message"
              rows={1}
              className="w-full py-2.5 px-2 bg-transparent text-gray-800 dark:text-[#d1d7db] focus:outline-none placeholder-[#8696a0] text-base resize-none leading-relaxed overflow-y-auto"
              style={{ maxHeight: '160px', minHeight: '40px' }}
              autoComplete="off"
              autoFocus
              spellCheck
            />

            {/* Attachment Button (Right inside input) */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 mr-1 mb-1 text-[#8696a0] hover:bg-gray-100 dark:hover:bg-[#374248] rounded-full transition-all flex-shrink-0"
              aria-label="Attach file"
              title="Attach any file"
            >
              <Paperclip className="w-5 h-5 -rotate-45" />
            </button>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!canSend}
            className={`p-3 rounded-full flex-shrink-0 transition-all mb-0.5 ${
              canSend
                ? 'bg-[#00a884] dark:bg-[#00a884] text-white hover:bg-[#008f72] active:scale-95 shadow-md'
                : 'bg-[#00a884] dark:bg-[#00a884] text-white opacity-50 cursor-not-allowed shadow-md'
            }`}
            aria-label="Send message"
          >
            <Send className="w-5 h-5 ml-0.5" />
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

        {/* Hint text */}
        <p className="text-[10px] text-gray-400 dark:text-gray-600 text-center mt-1 select-none">
          Enter to send · Shift+Enter for new line · Any file up to 10 MB
        </p>
      </div>
    </form>
  );
};

export default MessageInput;
