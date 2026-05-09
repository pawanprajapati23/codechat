import { useState } from 'react';
import { Check, CheckCheck, Download, FileText, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { formatTime, generateUserColor, getInitials } from '../utils/helpers';
import CodeBlock from './CodeBlock';
import { motion } from 'framer-motion';

const MessageBubble = ({ message, isOwn, darkMode, onReaction, onEditMessage, onDeleteMessage }) => {
  const { text, timestamp, sender, reactions = {}, attachment, status, isEdited, isDeleted, _id, id } = message;
  const messageId = _id || id;
  const userColor = generateUserColor(sender);
  const initials = getInitials(sender);
  const [showReactions, setShowReactions] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text || '');

  // Detect code blocks (```language\ncode\n```)
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const hasCodeBlock = codeBlockRegex.test(text || '');

  const handleEditSubmit = () => {
    if (editText.trim() !== text && onEditMessage && messageId) {
      onEditMessage(messageId, editText.trim());
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (onDeleteMessage && messageId) {
      onDeleteMessage(messageId);
    }
    setShowOptions(false);
  };

  const renderMessageContent = () => {
    if (isDeleted) {
      return (
        <p className="text-sm sm:text-base leading-relaxed italic opacity-70 flex items-center gap-1">
          🚫 This message was deleted
        </p>
      );
    }

    if (isEditing) {
      return (
        <div className="flex flex-col gap-2 min-w-[200px]">
          <textarea
            className="text-sm sm:text-base w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-green-500"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={2}
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-1">
            <button onClick={() => { setIsEditing(false); setEditText(text || ''); }} className="text-xs bg-gray-200 dark:bg-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancel</button>
            <button onClick={handleEditSubmit} className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-full shadow-sm transition-colors">Save</button>
          </div>
        </div>
      );
    }

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
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end gap-2 mb-1.5 sm:mb-2 ${isOwn ? 'flex-row-reverse' : ''}`}
      onMouseLeave={() => setShowOptions(false)}
    >
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

        <div className="flex items-center gap-1">
          {/* Options Menu (Edit/Delete) */}
          {isOwn && !isDeleted && (
            <div className={`relative opacity-0 group-hover:opacity-100 transition-opacity ${showOptions ? 'opacity-100' : ''}`}>
              <button 
                onClick={() => setShowOptions(!showOptions)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <MoreVertical size={16} />
              </button>
              
              {showOptions && (
                <div className="absolute right-0 bottom-full mb-1 z-20 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 w-28 overflow-hidden">
                  <button 
                    onClick={() => { setIsEditing(true); setShowOptions(false); }}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Message Content */}
          <div
            className={`rounded-2xl ${hasCodeBlock || isEditing ? 'px-2 sm:px-3 py-2' : 'px-3 sm:px-3.5 py-2'} shadow-sm ${
              isOwn
                ? 'bg-[#dcf8c6] dark:bg-[#005c4b] text-gray-900 dark:text-[#e9edef] rounded-tr-sm'
                : 'bg-white dark:bg-[#202c33] text-gray-900 dark:text-[#e9edef] rounded-tl-sm border border-transparent dark:border-transparent'
            } ${isDeleted ? 'bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700' : ''}`}
            onDoubleClick={() => !isDeleted && setShowReactions(!showReactions)}
          >
            {renderMessageContent()}
            
            {/* Timestamp */}
            <span className={`mt-1 flex items-center gap-1 text-[10px] sm:text-xs opacity-70 ${isOwn ? 'justify-end text-gray-700 dark:text-gray-200' : 'justify-start text-gray-500 dark:text-gray-400'}`}>
              <span>{formatTime(timestamp)}</span>
              {isEdited && !isDeleted && <span className="italic opacity-80">(edited)</span>}
              {isOwn && !isDeleted && <MessageStatus status={status} />}
            </span>
          </div>
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
    </motion.div>
  );
};

const MessageStatus = ({ status }) => {
  if (status === 'seen') {
    return <CheckCheck className="h-3.5 w-3.5 text-sky-500" />;
  }

  if (status === 'delivered') {
    return <CheckCheck className="h-3.5 w-3.5" />;
  }

  return <Check className="h-3.5 w-3.5" />;
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
