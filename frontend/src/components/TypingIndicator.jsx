const TypingIndicator = () => {
  return (
    <div className="flex w-full mt-2 mb-1">
      <div className="bg-white dark:bg-[#202c33] rounded-lg rounded-tl-none px-3 py-2.5 shadow-sm relative max-w-[85%] sm:max-w-[75%] border border-transparent dark:border-[#2a3942]">
        {/* Tail */}
        <div className="absolute top-0 -left-2 w-2 h-2">
          <svg viewBox="0 0 8 13" width="8" height="13" className="text-white dark:text-[#202c33] fill-current">
            <path opacity="1" d="M1.533 3.118L8 12.118V0H2.8C1.033 0 .1 2.068 1.533 3.118z"></path>
          </svg>
        </div>
        
        <div className="flex gap-1 items-center justify-center h-4 pt-1 px-1">
          <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-[#8696a0] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-[#8696a0] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-[#8696a0] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
