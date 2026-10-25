import { useCallback, useEffect, useRef, useState } from 'react';
import { sendChatPrompt } from '../api/chatClient';
import type { ApiError, ChatMessage } from '../types/chat';
import type { AppSettings } from '../types/settings';
import { buildPrompt } from '../utils/promptBuilder';
import { clearStoredMessages, loadStoredMessages, saveStoredMessages } from '../utils/storage';

export function useChat(settings: AppSettings) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadStoredMessages());
  const [isLoading, setIsLoading] = useState(false);
  const [activeError, setActiveError] = useState<ApiError | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync messages to localStorage
  useEffect(() => {
    saveStoredMessages(messages);
  }, [messages]);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  }, []);

  const sendMessage = useCallback(
    async (question: string, context?: string) => {
      const trimmedQuestion = question.trim();
      if (!trimmedQuestion || isLoading) return;

      setActiveError(null);

      const userMessageId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const assistantMessageId = `asst_${Date.now() + 1}_${Math.random().toString(36).substring(2, 7)}`;

      const userMsg: ChatMessage = {
        id: userMessageId,
        role: 'user',
        content: trimmedQuestion,
        timestamp: Date.now(),
        contextUsed: context?.trim() || undefined,
      };

      // Create prompt using history prior to this new message
      const composedPrompt = buildPrompt(messages, trimmedQuestion, {
        includeHistory: settings.includeHistory,
        maxTurns: settings.maxHistoryTurns,
        context: context?.trim(),
      });

      userMsg.rawPromptSent = composedPrompt;

      // Append user message immediately
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const result = await sendChatPrompt(composedPrompt, {
          baseUrl: settings.apiBaseUrl,
          timeoutMs: settings.clientTimeoutSeconds * 1000,
          signal: controller.signal,
          useMock: settings.mockApi,
        });

        const assistantMsg: ChatMessage = {
          id: assistantMessageId,
          role: 'assistant',
          content: result.response,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err: unknown) {
        const apiError = err as ApiError;
        setActiveError(apiError);

        // Attach error message to assistant turn
        const errorMsg: ChatMessage = {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
          isError: true,
          error: apiError.message || 'An error occurred during inference.',
          rawPromptSent: composedPrompt,
        };

        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [isLoading, messages, settings]
  );

  const retryMessage = useCallback(
    async (failedMessageId: string) => {
      if (isLoading) return;

      // Locate the failed message and its preceding user message
      const failedIndex = messages.findIndex((m) => m.id === failedMessageId);
      if (failedIndex === -1) return;

      const failedMsg = messages[failedIndex];
      let userPrompt = '';
      let contextUsed: string | undefined;

      if (failedMsg.role === 'assistant') {
        const prevMsg = messages[failedIndex - 1];
        if (prevMsg && prevMsg.role === 'user') {
          userPrompt = prevMsg.content;
          contextUsed = prevMsg.contextUsed;
        }
      } else {
        userPrompt = failedMsg.content;
        contextUsed = failedMsg.contextUsed;
      }

      if (!userPrompt) return;

      // Remove the failed message (and if it's an assistant error, remove it from list)
      const cleanMessages = messages.filter((m) => m.id !== failedMessageId);
      setMessages(cleanMessages);

      // Re-trigger send
      const historyBeforeRetry = cleanMessages.filter((m) => m.role === 'user' && m.content === userPrompt ? false : true);
      const composedPrompt = buildPrompt(historyBeforeRetry, userPrompt, {
        includeHistory: settings.includeHistory,
        maxTurns: settings.maxHistoryTurns,
        context: contextUsed,
      });

      setIsLoading(true);
      setActiveError(null);

      const controller = new AbortController();
      abortControllerRef.current = controller;
      const assistantMessageId = `asst_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      try {
        const result = await sendChatPrompt(composedPrompt, {
          baseUrl: settings.apiBaseUrl,
          timeoutMs: settings.clientTimeoutSeconds * 1000,
          signal: controller.signal,
          useMock: settings.mockApi,
        });

        const assistantMsg: ChatMessage = {
          id: assistantMessageId,
          role: 'assistant',
          content: result.response,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err: unknown) {
        const apiError = err as ApiError;
        setActiveError(apiError);

        const errorMsg: ChatMessage = {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
          isError: true,
          error: apiError.message || 'Retry failed.',
          rawPromptSent: composedPrompt,
        };

        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [isLoading, messages, settings]
  );

  const clearChat = useCallback(() => {
    cancelRequest();
    setMessages([]);
    setActiveError(null);
    clearStoredMessages();
  }, [cancelRequest]);

  return {
    messages,
    isLoading,
    activeError,
    sendMessage,
    retryMessage,
    cancelRequest,
    clearChat,
  };
}
