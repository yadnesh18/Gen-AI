import React, { useEffect, useRef } from 'react';
import { Sparkles, Terminal, BookOpen, Layers } from 'lucide-react';
import type { ChatMessage } from '../types/chat';
import { MessageItem } from './MessageItem';
import { TypingIndicator } from './TypingIndicator';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onRetry: (messageId: string) => void;
  onSelectSamplePrompt: (prompt: string, context?: string) => void;
}

const SAMPLE_PROMPTS = [
  {
    icon: Sparkles,
    title: 'Explain Architecture',
    desc: 'How does Spring AI ChatClient connect with Google AI Studio?',
    prompt: 'Explain how Spring AI ChatClient communicates with Google AI Studio for Gemma model inference.',
  },
  {
    icon: Layers,
    title: 'RAG Grounding Test',
    desc: 'Ask a question with custom reference context',
    context: 'The Acme Corp Q3 profit margin increased by 14.2% driven by enterprise cloud subscriptions, totaling $42M in net recurring revenue.',
    prompt: 'What was the percentage increase in profit margin and the total net recurring revenue?',
  },
  {
    icon: Terminal,
    title: 'Java Test Case',
    desc: 'Generate a MockMvc test for POST /api/v1/chat',
    prompt: 'Write a MockMvc unit test in Java for a Spring Boot controller handling POST /api/v1/chat.',
  },
  {
    icon: BookOpen,
    title: 'Stateless Conversation',
    desc: 'Explain how frontend history composition works',
    prompt: 'Why does a stateless inference microservice rely on the client to manage and send conversational history?',
  },
];

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  onRetry,
  onSelectSamplePrompt,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center select-none animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 shadow-xs">
          <Sparkles className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          QA Inference Assistant
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-8">
          Direct inference interface for the Gemma model via Spring Boot. All retrieval is applied upstream or provided via the Context panel.
        </p>

        {/* Sample prompt cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl w-full text-left">
          {SAMPLE_PROMPTS.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => onSelectSamplePrompt(item.prompt, item.context)}
                className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/70 hover:border-blue-400 dark:hover:border-blue-500/80 hover:shadow-xs transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1 text-xs font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  <Icon className="w-4 h-4 text-blue-500" />
                  <span>{item.title}</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {item.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 space-y-2"
      aria-live="polite"
      role="log"
    >
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} onRetry={onRetry} />
      ))}

      {isLoading && <TypingIndicator />}

      <div ref={bottomRef} />
    </div>
  );
};
