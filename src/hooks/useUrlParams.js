import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

// for list filters kept in the URL: empty values drop the key
export default function useUrlParams() {
  const [params, setParams] = useSearchParams();

  const updateParams = useCallback((changes, options) => setParams((prev) => {
    const next = new URLSearchParams(prev);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, String(v)) : next.delete(k)));
    return next;
  }, options), [setParams]);

  return [params, updateParams];
}
