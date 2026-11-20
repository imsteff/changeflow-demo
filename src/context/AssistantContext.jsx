import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AssistantContext = createContext(null);

// for the chameleon skin: the status of the CR on screen
export function AssistantProvider({ children }) {
  const [status, setStatus] = useState(null);
  const value = useMemo(() => ({ status, setStatus }), [status]);
  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
}

export const useAssistant = () => useContext(AssistantContext);

// for screens that show one CR; a no-op outside the app shell
export function useAssistantTone(status) {
  const setStatus = useContext(AssistantContext)?.setStatus;
  useEffect(() => {
    if (!setStatus) return undefined;
    setStatus(status || null);
    return () => setStatus(null);
  }, [setStatus, status]);
}
