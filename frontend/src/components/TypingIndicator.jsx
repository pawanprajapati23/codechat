const TypingIndicator = ({ username }) => {
  return (
    <div className="flex items-center gap-2 mb-2.5 sm:mb-3">
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center shadow-md">
        <span className="text-xs">💭</span>
      </div>
      
      <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-bl-md px-3 sm:px-4 py-2 sm:py-3 shadow-md border border-gray-200 dark:border-gray-600">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 bg-indigo-400 dark:bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-purple-400 dark:bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-pink-400 dark:bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
      
      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 italic">
        {username} typing...
      </span>
    </div>
  );
};

export default TypingIndicator;
