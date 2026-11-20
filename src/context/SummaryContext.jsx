import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getSummary } from '@/services/crService';

const SummaryContext = createContext(null);

// for sidebar badges and the inbox banner
export function SummaryProvider({ children }) {
  const [summary, setSummary] = useState(null);

  const refresh = useCallback(() => getSummary().then(setSummary).catch(() => {}), []);

  useEffect(() => {
    refresh();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [refresh]);

  const value = useMemo(() => ({ summary, refresh }), [summary, refresh]);
  return <SummaryContext.Provider value={value}>{children}</SummaryContext.Provider>;
}

export const useSummary = () => {
  const ctx = useContext(SummaryContext);
  if (!ctx) throw new Error('useSummary must be used inside SummaryProvider');
  return ctx;
};
