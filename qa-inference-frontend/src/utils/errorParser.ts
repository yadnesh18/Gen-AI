import type { ApiError } from '../types/chat';

/**
 * Defensively extracts error information from an HTTP response and raw body.
 */
export function parseApiError(status: number, statusText: string, rawBodyText: string): ApiError {
  let parsed: Record<string, unknown> | null = null;

  try {
    if (rawBodyText && rawBodyText.trim().startsWith('{')) {
      parsed = JSON.parse(rawBodyText);
    }
  } catch {
    // Non-JSON or malformed error body
    parsed = null;
  }

  // Extract candidate message/detail fields defensively
  let rawMessage: string | undefined;
  let rawError: string | undefined;
  let details: string[] | undefined;

  if (parsed && typeof parsed === 'object') {
    if (typeof parsed.message === 'string' && parsed.message.trim()) {
      rawMessage = parsed.message.trim();
    }
    if (typeof parsed.error === 'string' && parsed.error.trim()) {
      rawError = parsed.error.trim();
    }

    // detail can be string or array
    if (Array.isArray(parsed.details)) {
      details = parsed.details.map((d) => String(d));
    } else if (typeof parsed.detail === 'string' && parsed.detail.trim()) {
      details = [parsed.detail.trim()];
    } else if (Array.isArray(parsed.detail)) {
      details = parsed.detail.map((d) => String(d));
    }
  }

  // Formulate a friendly, actionable message based on status and parsed details
  let friendlyMessage = '';

  switch (status) {
    case 400: {
      if (details && details.length > 0) {
        friendlyMessage = `Please enter a valid prompt: ${details.join(', ')}`;
      } else if (rawMessage && !rawMessage.toLowerCase().includes('internal')) {
        friendlyMessage = rawMessage.toLowerCase().includes('validation')
          ? 'Please enter a valid prompt.'
          : rawMessage;
      } else {
        friendlyMessage = 'Please enter a valid prompt.';
      }
      break;
    }
    case 504: {
      friendlyMessage = 'The model took too long to respond. Try again or shorten the prompt.';
      break;
    }
    case 502: {
      friendlyMessage = rawMessage || 'Upstream AI model service failed. Please try again in a few moments.';
      break;
    }
    case 503: {
      friendlyMessage = 'The inference service is temporarily unavailable. Please try again later.';
      break;
    }
    case 500: {
      friendlyMessage = rawMessage || 'An unexpected error occurred on the server. Please try again.';
      break;
    }
    default: {
      if (status >= 500) {
        friendlyMessage = rawMessage || `Server error (${status}). Please try again.`;
      } else if (status >= 400) {
        friendlyMessage = rawMessage || `Request error (${status}): ${statusText || 'Bad request'}`;
      } else {
        friendlyMessage = rawMessage || `Unexpected response (${status})`;
      }
    }
  }

  return {
    status,
    message: friendlyMessage,
    error: rawError || statusText,
    details,
    rawBody: parsed || rawBodyText,
  };
}

/**
 * Parses client-side/fetch exceptions (e.g. timeout, abort, offline).
 */
export function parseClientException(err: unknown, isTimedOut = false): ApiError {
  if (err instanceof DOMException && err.name === 'AbortError') {
    if (isTimedOut) {
      return {
        status: 408,
        message: 'The model took too long to respond. Try again or shorten the prompt.',
        isTimeout: true,
      };
    }
    return {
      status: 499,
      message: 'Request was cancelled.',
      isCancelled: true,
    };
  }

  const errMessage = err instanceof Error ? err.message : String(err);

  // Network offline / connection refused
  if (
    errMessage.includes('Failed to fetch') ||
    errMessage.includes('NetworkError') ||
    errMessage.includes('Load failed') ||
    errMessage.includes('ECONNREFUSED')
  ) {
    return {
      status: 0,
      message: "Can't reach the server. Make sure qa-inference-service is running on port 8080.",
      isNetworkError: true,
      error: errMessage,
    };
  }

  return {
    status: 0,
    message: errMessage || 'An unknown network error occurred.',
    isNetworkError: true,
    error: errMessage,
  };
}
