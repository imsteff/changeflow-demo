import { createContext, useCallback, useContext, useMemo } from 'react';
import { getDemoUser } from '@/mockData/demoAuth';

const AuthContext = createContext(null);

// for the demo: always signed in as the selected persona
export function AuthProvider({ children }) {
  const signIn = useCallback(() => {}, []);
  const value = useMemo(() => ({ user: getDemoUser(), signIn }), [signIn]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
