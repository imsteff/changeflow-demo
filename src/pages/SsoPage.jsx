import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import SplashScreen, { queueSplashExit } from '@/components/common/SplashScreen';

// for the demo: no sign-in step, the splash leads straight into the app
export default function SsoPage() {
  const navigate = useNavigate();
  const [splashDone, setSplashDone] = useState(false);
  const finishSplash = useCallback(() => setSplashDone(true), []);

  useEffect(() => {
    if (!splashDone) return;
    queueSplashExit();
    navigate('/', { replace: true });
  }, [splashDone, navigate]);

  return <SplashScreen onDone={finishSplash} />;
}
