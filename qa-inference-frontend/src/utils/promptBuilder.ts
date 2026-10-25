import type { ChatMessage } from '../types/chat';

export interface PromptBuilderOptions {
  includeHistory?: boolean;
  maxTurns?: number;
  context?: string;
}

/**
 * Composes the final prompt sent to the backend.
 *
 * Rules:
 * 1. If context is provided, question becomes:
 *    Context:
 *    {context}
 *
 *    Question:
 *    {question}
 * 2. If includeHistory is true, prior messages (up to maxTurns) are formatted as:
 *    User: ...
 *    Assistant: ...
 *    followed by:
 *    User: {questionContent}
 * 3. If includeHistory is false or no prior messages exist, returns just the questionContent.
 */
export function buildPrompt(
  messages: ChatMessage[],
  question: string,
  options: PromptBuilderOptions = {}
): string {
  const { includeHistory = true, maxTurns = 6, context = '' } = options;

  const trimmedQuestion = question.trim();
  const trimmedContext = context.trim();

  // If question is empty, return empty prompt
  if (!trimmedQuestion) {
    return '';
  }

  // Build current turn content (with context if supplied)
  const currentTurnContent = trimmedContext
    ? `Context:\n${trimmedContext}\n\nQuestion:\n${trimmedQuestion}`
    : trimmedQuestion;

  if (!includeHistory) {
    return currentTurnContent;
  }

  // Filter out error messages or empty messages
  const validHistory = messages.filter(
    (msg) => !msg.isError && msg.content && msg.content.trim().length > 0
  );

  if (validHistory.length === 0) {
    return currentTurnContent;
  }

  // Take the last maxTurns messages
  const turnsToInclude = validHistory.slice(-Math.max(1, maxTurns));

  const historyLines = turnsToInclude.map((msg) => {
    const prefix = msg.role === 'user' ? 'User' : 'Assistant';
    return `${prefix}: ${msg.content.trim()}`;
  });

  return `${historyLines.join('\n\n')}\n\nUser: ${currentTurnContent}`;
}
