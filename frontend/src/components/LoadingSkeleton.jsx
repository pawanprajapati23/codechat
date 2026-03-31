const LoadingSkeleton = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-4 animate-pulse">
      {/* Logo skeleton */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full mb-4"></div>
      
      {/* Text skeletons */}
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
    </div>
  );
};

export const MessageSkeleton = ({ isOwn = false }) => {
  return (
    <div className={`flex items-end gap-2 mb-2.5 sm:mb-3 ${isOwn ? 'flex-row-reverse' : ''} animate-pulse`}>
      {/* Avatar skeleton */}
      {!isOwn && (
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0"></div>
      )}

      {/* Message bubble skeleton */}
      <div className={`max-w-[75%] sm:max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Sender name skeleton */}
        {!isOwn && (
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1 ml-2"></div>
        )}

        {/* Message content skeleton */}
        <div className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 shadow-md ${
          isOwn
            ? 'bg-gradient-to-br from-indigo-300 to-purple-300 dark:from-indigo-700 dark:to-purple-700'
            : 'bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600'
        }`}>
          <div className={`h-4 rounded ${isOwn ? 'bg-white/30' : 'bg-gray-300 dark:bg-gray-600'} w-48 mb-2`}></div>
          <div className={`h-4 rounded ${isOwn ? 'bg-white/30' : 'bg-gray-300 dark:bg-gray-600'} w-32 mb-1`}></div>
          <div className={`h-3 rounded ${isOwn ? 'bg-white/20' : 'bg-gray-300 dark:bg-gray-600'} w-12 mt-2`}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
