import { Download } from 'lucide-react';

const ExportChat = ({ messages, roomCode, username }) => {
  const exportAsText = () => {
    const header = `CodeChat Export\nRoom: ${roomCode}\nExported by: ${username}\nDate: ${new Date().toLocaleString()}\n${'='.repeat(50)}\n\n`;
    
    const messagesText = messages.map(msg => {
      if (msg.isSystem) {
        return `[SYSTEM] ${msg.text}`;
      }
      const time = new Date(msg.timestamp).toLocaleTimeString();
      return `[${time}] ${msg.sender}: ${msg.text}`;
    }).join('\n');

    const content = header + messagesText;
    downloadFile(content, `codechat-${roomCode}-${Date.now()}.txt`, 'text/plain');
  };

  const exportAsJSON = () => {
    const data = {
      roomCode,
      exportedBy: username,
      exportDate: new Date().toISOString(),
      messageCount: messages.length,
      messages: messages.map(msg => ({
        sender: msg.sender || 'System',
        text: msg.text,
        timestamp: msg.timestamp,
        isSystem: msg.isSystem || false
      }))
    };

    const content = JSON.stringify(data, null, 2);
    downloadFile(content, `codechat-${roomCode}-${Date.now()}.json`, 'application/json');
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (messages.length === 0) return null;

  return (
    <div className="flex gap-2">
      <button
        onClick={exportAsText}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm"
        title="Export as TXT"
      >
        <Download className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        <span className="hidden sm:inline text-gray-700 dark:text-gray-200">TXT</span>
      </button>
      
      <button
        onClick={exportAsJSON}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm"
        title="Export as JSON"
      >
        <Download className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        <span className="hidden sm:inline text-gray-700 dark:text-gray-200">JSON</span>
      </button>
    </div>
  );
};

export default ExportChat;
