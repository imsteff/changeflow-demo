import { Navigate } from 'react-router';
import { canSubmit } from '@/constants/cr';
import { useAuth } from '@/context/AuthContext';

// for approver-only users: their pages live in the Inbox
export default function RequireSubmitter({ children }) {
  const { user } = useAuth();
  if (!canSubmit(user)) return <Navigate to="/inbox" replace />;
  return children;
}
