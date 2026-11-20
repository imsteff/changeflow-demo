import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage } from '@/services/api';

// for page data: reload() keeps old data on screen
export default function useAsync(load, deps) {
  const [state, setState] = useState({ data: null, error: '', status: 0, loading: true });
  const callId = useRef(0);
  const loadRef = useRef(load);
  loadRef.current = load;

  const run = useCallback((keep = false) => {
    const id = ++callId.current;
    setState((prev) => ({ data: keep ? prev.data : null, error: '', status: 0, loading: true }));
    Promise.resolve()
      .then(() => loadRef.current())
      .then(
        (data) => { if (id === callId.current) setState({ data, error: '', status: 0, loading: false }); },
        (err) => {
          if (id !== callId.current) return;
          setState((prev) => ({ ...prev, error: errorMessage(err), status: err?.response?.status || 0, loading: false }));
        },
      );
  }, []);

  useEffect(() => {
    run();
    return () => { callId.current += 1; };
  }, deps);

  const reload = useCallback(() => run(true), [run]);
  return { ...state, reload };
}
