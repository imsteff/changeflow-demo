import { createContext, useCallback, useContext, useLayoutEffect, useMemo } from 'react';
import { ROLES } from '@/constants/cr';
import { useAuth } from '@/context/AuthContext';
import usePersistentState from '@/hooks/usePersistentState';

const ThemeContext = createContext(null);

const applyTheme = (theme) => {
  const root = document.documentElement;
  const dark = theme === 'dark';
  if (root.classList.contains('dark') === dark) return;
  root.classList.add('theme-switching');
  root.classList.toggle('dark', dark);
  root.getBoundingClientRect();
  root.classList.remove('theme-switching');
};

// for requestors: always light
export function ThemeProvider({ children }) {
  const { user } = useAuth();
  const [preference, setPreference] = usePersistentState('crp.theme', 'light');
  const isRequestor = user?.role === ROLES.REQUESTOR;
  const theme = isRequestor ? 'light' : preference;

  useLayoutEffect(() => applyTheme(theme), [theme]);

  const toggleTheme = useCallback(() => setPreference((t) => (t === 'dark' ? 'light' : 'dark')), [setPreference]);

  const value = useMemo(
    () => ({ theme, canToggle: !!user && !isRequestor, toggleTheme }),
    [theme, user, isRequestor, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};
