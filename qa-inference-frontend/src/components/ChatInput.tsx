import React, { useEffect, useRef, useState } from 'react';
import { Send, Square } from 'lucide-react';
import { ContextInput } from './ContextInput';

interface ChatInputProps {
  onSendMessage: (question: string, context?: string) => void;
  isLoading: boolean;
  onCancelRequest: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  onCancelRequest,
}) => {
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 180);
      textarea.style.height = `${Math.max(48, newHeight)}px`;
    }
  }, [question]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim() || isLoading) return;

    onSendMessage(question, context);
    setQuestion('');
    // Notice: context remains preserved so user can ask follow-ups against the same context,
    // or user can clear it using the context accordion clear button!

    if (textareaRef.current) {
      textareaRef.current.style.height = '48px';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSend = question.trim().length > 0 && !isLoading;

  return (
    <div className="w-full">
      {/* Context Accordion */}
      <ContextInput
        context={context}
        onChange={setContext}
        onClear={() => setContext('')}
        disabled={isLoading}
      />

      {/* Input container */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:border-blue-500 transition-all"
      >
        <div className="flex items-end gap-2 p-2 sm:p-2.5">
          <textarea
            ref={textareaRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={1}
            placeholder={
              isLoading
                ? 'Waiting for model response...'
                : 'Ask a question... (Enter to send, Shift+Enter for new line)'
            }
            className="flex-1 max-h-44 p-2 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent resize-none focus:outline-hidden disabled:opacity-60"
            aria-label="Chat prompt message"
          />

          <div className="flex items-center gap-1.5 pb-0.5 flex-shrink-0">
            {isLoading ? (
              <button
                type="button"
                onClick={onCancelRequest}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors cursor-pointer shadow-xs"
                title="Cancel in-flight inference request"
                aria-label="Cancel request"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">Cancel</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!canSend}
                className={`flex items-center justify-center p-2.5 rounded-xl transition-all ${
                  canSend
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer active:scale-95'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
                title="Send message (Enter)"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Footer shortcuts hint */}
        <div className="flex items-center justify-between px-3.5 pb-2 text-[11px] text-gray-400 dark:text-gray-500 select-none">
          <span>
            <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-[10px] font-mono">Enter</kbd> sends
            {' • '}
            <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-[10px] font-mono">Shift+Enter</kbd> newline
          </span>
          {question.trim().length > 0 && (
            <span className="font-mono text-[10px]">
              {question.trim().length} chars
            </span>
          )}
        </div>
      </form>
    </div>
  );
};
