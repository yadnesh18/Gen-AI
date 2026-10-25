export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  isError?: boolean;
  error?: string;
  rawPromptSent?: string;
  contextUsed?: string;
  inFlight?: boolean;
}

export interface ChatRequest {
  prompt: string;
}

export interface ChatResponse {
  response: string;
}

export interface ApiError {
  status: number;
  message: string;
  error?: string;
  details?: string[];
  isNetworkError?: boolean;
  isTimeout?: boolean;
  isCancelled?: boolean;
  rawBody?: unknown;
}
