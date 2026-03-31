import { Eye } from 'lucide-react';

const ReadReceipts = ({ seenCount, totalUsers }) => {
  if (seenCount <= 1) return null;

  return (
    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
      <Eye className="w-3 h-3" />
      <span>Seen by {seenCount}</span>
    </div>
  );
};

export default ReadReceipts;
