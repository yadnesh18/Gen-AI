import { mockHealthCheck } from './mockService';

export interface HealthCheckResult {
  status: 'UP' | 'DOWN' | 'UNKNOWN';
  details?: Record<string, unknown>;
  error?: string;
  isMock?: boolean;
}

/**
 * Checks backend health via GET /actuator/health.
 */
export async function checkBackendHealth(
  baseUrl = '',
  useMock = false,
  signal?: AbortSignal
): Promise<HealthCheckResult> {
  if (useMock) {
    const mock = await mockHealthCheck();
    return {
      status: mock.status,
      details: mock.details,
      isMock: true,
    };
  }

  const envBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const finalBaseUrl = (baseUrl.trim() || envBaseUrl).replace(/\/+$/, '');
  const endpoint = `${finalBaseUrl}/actuator/health`;

  try {
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), 6000);

    const onAbort = () => timeoutController.abort();
    if (signal) {
      signal.addEventListener('abort', onAbort, { once: true });
    }

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: timeoutController.signal,
    });

    clearTimeout(timeoutId);
    if (signal) {
      signal.removeEventListener('abort', onAbort);
    }

    if (!response.ok) {
      return {
        status: 'DOWN',
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      status: data.status === 'UP' ? 'UP' : 'DOWN',
      details: data,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      status: 'DOWN',
      error: msg,
    };
  }
}
