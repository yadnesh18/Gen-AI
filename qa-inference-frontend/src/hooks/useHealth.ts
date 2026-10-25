import { useCallback, useEffect, useState } from 'react';
import { checkBackendHealth } from '../api/health';

export function useHealth(baseUrl = '', mockMode = false, pollIntervalMs = 30000) {
  const [status, setStatus] = useState<'UP' | 'DOWN' | 'UNKNOWN'>('UNKNOWN');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [details, setDetails] = useState<Record<string, unknown> | undefined>();

  const check = useCallback(async () => {
    setIsChecking(true);
    try {
      const result = await checkBackendHealth(baseUrl, mockMode);
      setStatus(result.status);
      setDetails(result.details);
      setLastChecked(new Date());
    } catch {
      setStatus('DOWN');
      setLastChecked(new Date());
    } finally {
      setIsChecking(false);
    }
  }, [baseUrl, mockMode]);

  useEffect(() => {
    check();
    const interval = setInterval(check, pollIntervalMs);
    return () => clearInterval(interval);
  }, [check, pollIntervalMs]);

  return {
    status,
    isChecking,
    lastChecked,
    details,
    checkNow: check,
  };
}
