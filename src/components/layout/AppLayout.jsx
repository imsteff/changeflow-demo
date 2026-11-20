import { Outlet } from 'react-router';
import { Toaster } from '@/components/ui/sonner';
import { AssistantProvider } from '@/context/AssistantContext';
import { SummaryProvider } from '@/context/SummaryContext';
import ChameleonAssistant from '@/components/common/ChameleonAssistant';
import { SplashExit } from '@/components/common/SplashScreen';
import AppHeader from '@/components/layout/AppHeader';
import Sidebar from '@/components/layout/Sidebar';

export default function AppLayout() {
  return (
    <SummaryProvider>
      <AssistantProvider>
        <div className="min-h-screen bg-nav">
          <AppHeader />
          <div className="flex">
            <Sidebar />
            <main className="min-h-[calc(100vh-68px)] min-w-0 flex-1 rounded-tl-[14px] bg-canvas px-4 py-6 sm:px-6 lg:py-8">
              <Outlet />
            </main>
          </div>
        </div>
        {/* for drag bounds: the viewport, since the window scrolls */}
        <div className="pointer-events-none fixed inset-0 z-30">
          <ChameleonAssistant />
        </div>
      </AssistantProvider>
      <Toaster />
      <SplashExit />
    </SummaryProvider>
  );
}
