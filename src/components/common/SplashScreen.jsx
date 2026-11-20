import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const SPLASH_MS = 2400;
const EXIT_MS = 780;

const ARROW = 'M44.75 9.92L48.29 21.78L36.25 24.64L38.75 20.31A13.5 13.5 0 1 0 41.55 41.55L46.50 46.50A20.5 20.5 0 1 1 42.25 14.25Z';

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// for the hand-off from /sso
let exitPending = false;
export const queueSplashExit = () => {
  exitPending = true;
};

// for the launch splash: onDone must be stable
export default function SplashScreen({ exiting = false, onDone }) {
  const rootRef = useRef(null);
  const dotRef = useRef(null);
  const [leaving, setLeaving] = useState(false);
  const intro = !exiting;

  useEffect(() => {
    if (exiting) return undefined;
    const timer = setTimeout(onDone, SPLASH_MS);
    return () => clearTimeout(timer);
  }, [exiting, onDone]);

  useLayoutEffect(() => {
    if (!exiting) return undefined;
    if (prefersReducedMotion()) {
      onDone();
      return undefined;
    }
    const dot = dotRef.current.getBoundingClientRect();
    rootRef.current.style.setProperty('--splash-x', `${dot.left + dot.width / 2}px`);
    rootRef.current.style.setProperty('--splash-y', `${dot.top + dot.height / 2}px`);
    rootRef.current.style.setProperty('--splash-d', `${dot.width}px`);
    setLeaving(true);
    const timer = setTimeout(onDone, EXIT_MS);
    return () => clearTimeout(timer);
  }, [exiting, onDone]);

  return (
    <div
      ref={rootRef}
      role="status"
      aria-label="Loading ChangeFlow"
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center',
        leaving && 'splash-leaving',
      )}
    >
      <span className="splash-bg absolute inset-0 bg-canvas bg-[radial-gradient(circle_at_50%_42%,rgb(var(--c-surface))_0%,transparent_60%)]" aria-hidden="true" />
      <div className="splash-content relative flex flex-col items-center">
        <svg viewBox="0 0 64 64" className="h-20 w-20 drop-shadow-[0_10px_24px_rgba(0,0,0,0.18)]" aria-hidden="true">
          <defs>
            <mask id="cr-splash-ring" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
              <circle
                cx="32"
                cy="32"
                r="17"
                fill="none"
                stroke="#fff"
                strokeWidth="19"
                pathLength="100"
                strokeDasharray="100"
                strokeDashoffset="0"
                transform="rotate(45 32 32)"
                className={cn(intro && 'animate-splash-draw motion-reduce:animate-none')}
              />
            </mask>
          </defs>
          <rect width="64" height="64" rx="14" fill="#101010" />
          <g className={cn(intro && 'animate-splash-spin motion-reduce:animate-none')} style={{ transformBox: 'view-box', transformOrigin: '34px 33px' }}>
            <g transform="translate(2 1)">
              <path d={ARROW} fill="#fff" mask="url(#cr-splash-ring)" />
            </g>
          </g>
          <circle
            ref={dotRef}
            cx="34"
            cy="33"
            r="5.5"
            className={cn('fill-brand', intro && 'animate-splash-pop motion-reduce:animate-none')}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          />
        </svg>

        <p className={cn('mt-5 text-base font-semibold tracking-tight text-ink', intro && 'animate-splash-rise motion-reduce:animate-none')}>
          <span className={cn(intro && 'splash-shimmer')}>ChangeFlow</span>
        </p>

        <div className="mt-4 h-[3px] w-40 overflow-hidden rounded-full bg-line">
          <div
            className={cn('h-full origin-left rounded-full bg-brand', intro && 'animate-splash-bar')}
            style={intro ? { animationDuration: `${SPLASH_MS}ms` } : undefined}
          />
        </div>
      </div>
      {leaving && <span className="splash-dot" aria-hidden="true" />}
    </div>
  );
}

// for AppLayout: once per sign-in
export function SplashExit() {
  const [show, setShow] = useState(() => exitPending);
  const finish = useCallback(() => {
    exitPending = false;
    setShow(false);
  }, []);

  if (!show) return null;
  return <SplashScreen exiting onDone={finish} />;
}
