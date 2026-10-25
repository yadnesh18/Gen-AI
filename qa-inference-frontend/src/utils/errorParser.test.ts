import { describe, expect, it } from 'vitest';
import { parseApiError, parseClientException } from './errorParser';

describe('errorParser', () => {
  describe('parseApiError', () => {
    it('parses standard Spring Boot validation 400 with details array', () => {
      const rawBody = JSON.stringify({
        timestamp: '2026-10-25T16:00:00Z',
        status: 400,
        error: 'Bad Request',
        message: 'Request validation failed',
        path: '/api/v1/chat',
        details: ['prompt must not be blank'],
      });

      const parsed = parseApiError(400, 'Bad Request', rawBody);

      expect(parsed.status).toBe(400);
      expect(parsed.message).toContain('Please enter a valid prompt: prompt must not be blank');
      expect(parsed.details).toEqual(['prompt must not be blank']);
    });

    it('handles 400 without details gracefully', () => {
      const rawBody = JSON.stringify({
        status: 400,
        error: 'Bad Request',
        message: 'Validation failure',
      });

      const parsed = parseApiError(400, 'Bad Request', rawBody);

      expect(parsed.status).toBe(400);
      expect(parsed.message).toBe('Please enter a valid prompt.');
    });

    it('parses 504 Gateway Timeout with friendly advice', () => {
      const rawBody = JSON.stringify({
        status: 504,
        error: 'Gateway Timeout',
        message: 'The AI model did not respond in time. Please retry.',
      });

      const parsed = parseApiError(504, 'Gateway Timeout', rawBody);

      expect(parsed.status).toBe(504);
      expect(parsed.message).toBe(
        'The model took too long to respond. Try again or shorten the prompt.'
      );
    });

    it('parses 502 Upstream AI failure defensively', () => {
      const rawBody = JSON.stringify({
        status: 502,
        error: 'Bad Gateway',
        message: 'Failed to get a response from the AI model',
      });

      const parsed = parseApiError(502, 'Bad Gateway', rawBody);

      expect(parsed.status).toBe(502);
      expect(parsed.message).toBe('Failed to get a response from the AI model');
    });

    it('handles HTML or non-JSON 500 error body without throwing', () => {
      const rawBody = '<html><body><h1>500 Internal Server Error</h1></body></html>';

      const parsed = parseApiError(500, 'Internal Server Error', rawBody);

      expect(parsed.status).toBe(500);
      expect(parsed.message).toContain('An unexpected error occurred');
    });

    it('falls back defensively when body contains detail field instead of details', () => {
      const rawBody = JSON.stringify({
        status: 400,
        detail: 'Invalid character encoding in prompt',
      });

      const parsed = parseApiError(400, 'Bad Request', rawBody);

      expect(parsed.status).toBe(400);
      expect(parsed.message).toContain('Invalid character encoding in prompt');
    });
  });

  describe('parseClientException', () => {
    it('handles AbortError timeout', () => {
      const abortErr = new DOMException('The operation was aborted', 'AbortError');
      const parsed = parseClientException(abortErr, true);

      expect(parsed.isTimeout).toBe(true);
      expect(parsed.message).toContain('The model took too long to respond');
    });

    it('handles user cancellation AbortError', () => {
      const abortErr = new DOMException('The operation was aborted', 'AbortError');
      const parsed = parseClientException(abortErr, false);

      expect(parsed.isCancelled).toBe(true);
      expect(parsed.message).toBe('Request was cancelled.');
    });

    it('identifies network failure / connection refused', () => {
      const netErr = new TypeError('Failed to fetch');
      const parsed = parseClientException(netErr);

      expect(parsed.isNetworkError).toBe(true);
      expect(parsed.message).toContain("Can't reach the server");
      expect(parsed.message).toContain('8080');
    });
  });
});
