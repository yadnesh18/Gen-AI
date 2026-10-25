import React from 'react';
import { Bot } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
  return (
    <div
      className="flex items-start gap-3 my-4 animate-fade-in"
      role="status"
      aria-label="Assistant is thinking"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
        <Bot className="w-4 h-4" />
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-200/50 dark:border-gray-700/50 flex items-center gap-1.5">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mr-2">Gemma is thinking</span>
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></span>
      </div>
    </div>
  );
};
