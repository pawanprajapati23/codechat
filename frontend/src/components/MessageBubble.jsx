import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { formatTime, generateUserColor, getInitials } from '../utils/helpers';
import CodeBlock from './CodeBlock';

const MessageBubble = ({ message, isOwn, darkMode, onReaction }) => {
  const { text, timestamp, sender, reactions = {}, attachment } = message;
  const userColor = generateUserColor(sender);
  const initials = getInitials(sender);
  const [showReactions, setShowReactions] = useState(false);

  // Detect code blocks (```language\ncode\n```)
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const hasCodeBlock = codeBlockRegex.test(text);

  const renderMessageContent = () => {
    const attachmentContent = attachment ? (
      <AttachmentPreview attachment={attachment} isOwn={isOwn} />
    ) : null;

    if (!hasCodeBlock) {
      return (
        <>
          {attachmentContent}
          {text && (
            <p className="text-sm sm:text-base leading-relaxed break-words whitespace-pre-wrap">
              {text}
            </p>
          )}
        </>
      );
    }

    // Split message into text and code blocks
    const parts = [];
    let lastIndex = 0;
    const regex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index),
        });
      }

      // Add code block
      parts.push({
        type: 'code',
        language: match[1] || 'javascript',
        content: match[2].trim(),
      });

      lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex),
      });
    }

    return (
      <>
        {attachmentContent}
        {parts.map((part, index) => {
          if (part.type === 'code') {
            return (
              <CodeBlock
                key={index}
                code={part.content}
                language={part.language}
                darkMode={darkMode}
              />
            );
          }
          return (
            <p key={index} className="text-sm sm:text-base leading-relaxed break-words whitespace-pre-wrap">
              {part.content}
            </p>
          );
        })}
      </>
    );
  };

  const quickReactions = ['👍', '❤️', '😂', '😮', '👏', '🔥'];

  const handleReactionClick = (emoji) => {
    if (onReaction) {
      onReaction(message, emoji);
    }
    setShowReactions(false);
  };

  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);

  return (
    <div className={`flex items-end gap-2 mb-2.5 sm:mb-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      {!isOwn && (
        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${userColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md`}>
          {initials}
        </div>
      )}

      {/* Message Bubble */}
      <div className={`max-w-[75%] sm:max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col relative group`}>
        {/* Sender Name */}
        {!isOwn && (
          <span className="text-xs text-gray-600 dark:text-gray-400 mb-1 ml-2 font-medium">
            {sender}
          </span>
        )}

        {/* Message Content */}
        <div
          className={`rounded-2xl ${hasCodeBlock ? 'px-2 sm:px-3 py-2' : 'px-3 sm:px-4 py-2 sm:py-2.5'} shadow-md ${
            isOwn
              ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white rounded-br-md'
              : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-md border border-gray-200 dark:border-gray-600'
          }`}
          onDoubleClick={() => setShowReactions(!showReactions)}
        >
          {renderMessageContent()}
          
          {/* Timestamp */}
          <span className={`text-[10px] sm:text-xs mt-1 block opacity-75 ${isOwn ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>
            {formatTime(timestamp)}
          </span>
        </div>

        {/* Reaction Picker (shows on double-click) */}
        {showReactions && (
          <div className={`absolute ${isOwn ? 'right-0' : 'left-0'} bottom-full mb-1 flex gap-1 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 p-1 animate-fade-in z-10`}>
            {quickReactions.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReactionClick(emoji)}
                className="hover:scale-125 transition-transform text-xl p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Display Reactions */}
        {totalReactions > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            {Object.entries(reactions).map(([emoji, count]) => (
              count > 0 && (
                <div
                  key={emoji}
                  className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-0.5 text-xs cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => handleReactionClick(emoji)}
                >
                  <span>{emoji}</span>
                  <span className="text-gray-600 dark:text-gray-400 font-medium">{count}</span>
                </div>
              )
            ))}
          </div>
        )}

        {/* Hint for reactions */}
        <div className={`absolute ${isOwn ? 'right-2' : 'left-2'} -top-6 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-400 dark:text-gray-500 pointer-events-none`}>
          Double-click to react
        </div>
      </div>
    </div>
  );
};

const AttachmentPreview = ({ attachment, isOwn }) => {
  const sizeInMb = attachment.size ? `${(attachment.size / (1024 * 1024)).toFixed(2)} MB` : '';

  if (attachment.type?.startsWith('image/')) {
    return (
      <a
        href={attachment.dataUrl}
        download={attachment.name}
        target="_blank"
        rel="noreferrer"
        className="mb-2 block overflow-hidden rounded-xl border border-white/20 bg-black/10"
      >
        <img
          src={attachment.dataUrl}
          alt={attachment.name}
          className="max-h-72 w-full object-contain"
        />
      </a>
    );
  }

  return (
    <a
      href={attachment.dataUrl}
      download={attachment.name}
      target="_blank"
      rel="noreferrer"
      className={`mb-2 flex min-w-0 items-center gap-3 rounded-xl px-3 py-2 ${
        isOwn ? 'bg-white/15 hover:bg-white/20' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
    >
      <FileText className="w-6 h-6 flex-shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{attachment.name}</span>
        <span className={`block text-xs ${isOwn ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
          PDF {sizeInMb && `- ${sizeInMb}`}
        </span>
      </span>
      <Download className="w-4 h-4 flex-shrink-0" />
    </a>
  );
};

export default MessageBubble;
