import type { ChatRequest, ChatResponse } from '../types/chat';
import { parseApiError, parseClientException } from '../utils/errorParser';
import { mockChatInference } from './mockService';

export interface SendChatOptions {
  baseUrl?: string;
  timeoutMs?: number;
  signal?: AbortSignal;
  useMock?: boolean;
}

/**
 * Sends a chat prompt to POST /api/v1/chat.
 * Adheres strictly to the contract: { "prompt": "..." } -> { "response": "..." }.
 */
export async function sendChatPrompt(
  prompt: string,
  options: SendChatOptions = {}
): Promise<ChatResponse> {
  const { baseUrl = '', timeoutMs = 35000, signal, useMock = false } = options;

  if (useMock) {
    return mockChatInference(prompt, signal);
  }

  // Resolve base URL (default empty string -> dev server proxy forwards to http://localhost:8080)
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const finalBaseUrl = (baseUrl.trim() || envBaseUrl).replace(/\/+$/, '');
  const endpoint = `${finalBaseUrl}/api/v1/chat`;

  // Set up client-side timeout slightly longer than backend timeout
  const timeoutController = new AbortController();
  let isTimedOut = false;
  const timeoutId = setTimeout(() => {
    isTimedOut = true;
    timeoutController.abort();
  }, timeoutMs);

  // Link caller signal if provided
  const onCallerAbort = () => {
    timeoutController.abort();
  };
  if (signal) {
    if (signal.aborted) {
      clearTimeout(timeoutId);
      throw parseClientException(new DOMException('Request was cancelled.', 'AbortError'), false);
    }
    signal.addEventListener('abort', onCallerAbort, { once: true });
  }

  try {
    const requestPayload: ChatRequest = { prompt };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(requestPayload),
      signal: timeoutController.signal,
    });

    clearTimeout(timeoutId);

    const rawText = await response.text();

    if (!response.ok) {
      const parsedError = parseApiError(response.status, response.statusText, rawText);
      throw parsedError;
    }

    try {
      const data = JSON.parse(rawText) as ChatResponse;
      if (typeof data.response !== 'string') {
        throw new Error('Response payload missing "response" field');
      }
      return data;
    } catch (parseErr) {
      throw {
        status: response.status,
        message: 'Invalid response format received from server.',
        rawBody: rawText,
        error: String(parseErr),
      };
    }
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    // If already an ApiError, rethrow
    if (typeof err === 'object' && err !== null && 'status' in err && 'message' in err) {
      throw err;
    }

    throw parseClientException(err, isTimedOut);
  } finally {
    if (signal) {
      signal.removeEventListener('abort', onCallerAbort);
    }
  }
}
