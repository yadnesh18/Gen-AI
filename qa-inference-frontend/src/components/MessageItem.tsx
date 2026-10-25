import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  AlertCircle,
  Bot,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  FileText,
  RefreshCw,
  User,
} from 'lucide-react';
import type { ChatMessage } from '../types/chat';

interface MessageItemProps {
  message: ChatMessage;
  onRetry?: (messageId: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, onRetry }) => {
  const [copied, setCopied] = useState(false);
  const [showPromptDetails, setShowPromptDetails] = useState(false);

  const isUser = message.role === 'user';
  const isError = Boolean(message.isError);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy to clipboard:', e);
    }
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`group flex w-full my-4 gap-3 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      } animate-fade-in`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-xs ${
          isUser
            ? 'bg-blue-600 text-white'
            : isError
            ? 'bg-red-500/10 text-red-600 dark:text-red-400'
            : 'bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
        }`}
        aria-hidden="true"
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : isError ? (
          <AlertCircle className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      {/* Message Content Container */}
      <div
        className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        {/* Context badge if user provided RAG context */}
        {isUser && message.contextUsed && (
          <div className="mb-1.5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
            <FileText className="w-3 h-3" />
            <span>Context included ({message.contextUsed.length} chars)</span>
          </div>
        )}

        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm transition-all ${
            isUser
              ? 'bg-blue-600 text-white rounded-tr-sm selection:bg-blue-400 selection:text-white'
              : isError
              ? 'bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 border border-red-200 dark:border-red-900/60 rounded-tl-sm w-full'
              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200/80 dark:border-gray-700/80 rounded-tl-sm w-full'
          }`}
        >
          {isError ? (
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 font-medium text-red-800 dark:text-red-300">
                  {message.error || 'Failed to complete inference.'}
                </div>
              </div>

              {onRetry && (
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => onRetry(message.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer shadow-xs focus:outline-hidden focus:ring-2 focus:ring-red-500"
                    aria-label="Retry failed request"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry Request</span>
                  </button>
                  <span className="text-xs text-red-600/80 dark:text-red-400/80">
                    Check server or prompt details
                  </span>
                </div>
              )}
            </div>
          ) : isUser ? (
            <div className="whitespace-pre-wrap break-words">{message.content}</div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none break-words overflow-x-auto">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const isInline = !className;
                    const codeText = String(children).replace(/\n$/, '');
                    if (isInline) {
                      return (
                        <code
                          className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-xs"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }
                    return (
                      <div className="relative group/code my-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-900 text-gray-100">
                        <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800 text-xs text-gray-400 font-mono border-b border-gray-700">
                          <span>{className?.replace('language-', '') || 'code'}</span>
                          <button
                            onClick={() => handleCopy(codeText)}
                            className="flex items-center gap-1 hover:text-gray-200 transition-colors p-1"
                            title="Copy code"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </button>
                        </div>
                        <pre className="p-3 overflow-x-auto text-xs font-mono leading-relaxed">
                          <code>{codeText}</code>
                        </pre>
                      </div>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer info: time, copy button, inspect prompt */}
        <div
          className={`flex items-center gap-2 mt-1.5 px-1 text-xs text-gray-400 dark:text-gray-500 ${
            isUser ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          <span>{formattedTime}</span>

          {!isUser && !isError && message.content && (
            <button
              onClick={() => handleCopy(message.content)}
              className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer px-1 py-0.5 rounded"
              title="Copy response to clipboard"
              aria-label="Copy message"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}

          {/* Prompt inspector (helpful for verifying RAG context / history) */}
          {message.rawPromptSent && (
            <button
              onClick={() => setShowPromptDetails(!showPromptDetails)}
              className="inline-flex items-center gap-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-[11px] underline underline-offset-2 ml-1"
              title="Inspect raw prompt sent to backend"
            >
              <span>Prompt</span>
              {showPromptDetails ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          )}
        </div>

        {/* Prompt details disclosure */}
        {showPromptDetails && message.rawPromptSent && (
          <div className="mt-2 p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-xs font-mono text-gray-700 dark:text-gray-300 w-full overflow-x-auto whitespace-pre-wrap max-h-48">
            <div className="font-semibold text-gray-500 dark:text-gray-400 mb-1 text-[11px] uppercase tracking-wider">
              Composed Prompt Sent to /api/v1/chat:
            </div>
            {message.rawPromptSent}
          </div>
        )}
      </div>
    </div>
  );
};
