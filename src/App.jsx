import { createBrowserRouter, RouterProvider } from 'react-router';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import RequireAuth from '@/components/RequireAuth';
import RequireSubmitter from '@/components/RequireSubmitter';
import AppLayout from '@/components/layout/AppLayout';
import { TooltipProvider } from '@/components/ui/tooltip';
import SsoPage from '@/pages/SsoPage';
import DecidePage from '@/pages/DecidePage';
import NewCrPage from '@/pages/NewCrPage';
import MyRequestsPage from '@/pages/MyRequestsPage';
import EditCrPage from '@/pages/EditCrPage';
import InboxPage from '@/pages/InboxPage';
import ReqTrackerPage from '@/pages/ReqTrackerPage';
import NotFoundPage from '@/pages/NotFoundPage';

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

// for LeaveGuard: needs a data router
const router = createBrowserRouter([
  { path: '/sso', element: <SsoPage /> },
  { path: '/decide/:token', element: <DecidePage /> },
  {
    element: <RequireAuth><AppLayout /></RequireAuth>,
    children: [
      { index: true, element: <RequireSubmitter><NewCrPage /></RequireSubmitter> },
      { path: 'requests/:crNo?', element: <RequireSubmitter><MyRequestsPage /></RequireSubmitter> },
      { path: 'requests/:crNo/edit', element: <RequireSubmitter><EditCrPage /></RequireSubmitter> },
      { path: 'inbox/:crNo?', element: <InboxPage /> },
      { path: 'req-tracker', element: <ReqTrackerPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
], { basename });

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider delayDuration={150}>
          <RouterProvider router={router} />
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
