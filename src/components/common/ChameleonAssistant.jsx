import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ChevronRight, X } from 'lucide-react';
import Chameleon from './Chameleon';
import { ASSISTANT_TONE, STATUS_TONES } from '@/constants/cr';
import { useAuth } from '@/context/AuthContext';
import { useAssistant } from '@/context/AssistantContext';
import { useSummary } from '@/context/SummaryContext';
import useEyeFollow from '@/hooks/useEyeFollow';
import useDragPosition from '@/hooks/useDragPosition';
import { buildNudges, nudgeSignature } from '@/utils/assistantNudges';
import { cn } from '@/lib/utils';

const SEEN_KEY = 'crp.assistant.seen';
const BLINK_MS = 6000;
const HOP_MS = 1000;
const SIZE = 72;

const readSeen = () => {
  try { return sessionStorage.getItem(SEEN_KEY); } catch { return null; }
};
const writeSeen = (value) => {
  try { sessionStorage.setItem(SEEN_KEY, value); } catch { /* for private mode */ }
};

export default function ChameleonAssistant() {
  const { summary } = useSummary();
  return summary ? <Assistant summary={summary} /> : null;
}

function Assistant({ summary }) {
  const { user } = useAuth();
  const status = useAssistant()?.status;
  const nudges = useMemo(() => buildNudges(summary), [summary]);
  const signature = nudgeSignature(nudges);
  const [open, setOpen] = useState(false);
  const [blink, setBlink] = useState(0);
  const [hop, setHop] = useState(false);
  const button = useRef(null);
  const box = useRef(null);
  useEyeFollow(button, 2.5);
  const { pos, area, dragging, wasDragged, handlers } = useDragPosition(box, { initial: { x: 24, y: 24 }, size: SIZE });

  const firstName = (user?.name || user?.uname || '').trim().split(/\s+/)[0];
  const tone = STATUS_TONES[status] || ASSISTANT_TONE;

  // for auto open: once per session, and again only when the reminders change
  useEffect(() => {
    if (signature && signature !== readSeen()) setOpen(true);
  }, [signature]);

  // for the hello hop each time the bubble opens
  useEffect(() => {
    if (!open) return undefined;
    setHop(true);
    const timer = setTimeout(() => setHop(false), HOP_MS);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    const timer = setInterval(() => { if (!document.hidden) setBlink((k) => k + 1); }, BLINK_MS);
    return () => clearInterval(timer);
  }, []);

  const close = () => {
    setOpen(false);
    writeSeen(signature);
  };

  const toggle = () => {
    if (wasDragged()) return;
    if (open) close();
    else setOpen(true);
  };

  const badge = !open && signature !== readSeen() ? nudges.length : 0;

  // for bubble placement: open toward the roomier side of the chameleon
  const onLeft = area.w > 0 && pos.x + SIZE / 2 > area.w / 2;
  const below = area.h > 0 && pos.y + SIZE / 2 > area.h / 2;
  const place = {
    ...(onLeft ? { left: area.w - pos.x - SIZE } : { right: pos.x }),
    ...(below ? { top: area.h - pos.y - SIZE } : { bottom: pos.y }),
  };

  return (
    <div
      ref={box}
      style={place}
      className={cn(
        'pointer-events-none absolute flex gap-3',
        below ? 'flex-col-reverse' : 'flex-col',
        onLeft ? 'items-start' : 'items-end',
      )}
    >
      {open && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            'pointer-events-auto relative w-[290px] max-w-[calc(100vw-32px)] rounded-xl border bg-card p-4 text-ink shadow-lg animate-in fade-in-0 duration-200',
            below ? 'slide-in-from-top-2' : 'slide-in-from-bottom-2',
          )}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-md text-subtle transition-colors hover:bg-canvas hover:text-ink"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          <p className="pr-6 text-sm font-semibold">Psst{firstName && `, ${firstName}`}!</p>

          {nudges.length ? (
            <ul className="mt-2 flex flex-col gap-1">
              {nudges.map((n) => (
                <li key={n.id}>
                  <Link
                    to={n.to}
                    onClick={close}
                    className="group -mx-2 flex items-start gap-2 rounded-md px-2 py-1.5 text-[13px] text-ink-soft transition-colors hover:bg-brand-tint hover:text-ink"
                  >
                    <span className="flex-1">{n.text}</span>
                    <ChevronRight className="mt-0.5 h-3.5 w-3.5 text-faint group-hover:text-brand" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[13px] text-ink-soft">You're all caught up. Nothing needs your attention right now.</p>
          )}

          <span
            aria-hidden
            className={cn(
              'absolute h-3 w-3 rotate-45 border-border bg-card',
              below ? '-top-[7px] border-l border-t' : '-bottom-[7px] border-b border-r',
              onLeft ? 'left-[30px]' : 'right-[30px]',
            )}
          />
        </div>
      )}

      <button
        ref={button}
        type="button"
        onClick={toggle}
        {...handlers}
        aria-label={open ? 'Hide reminders' : 'Show reminders'}
        aria-expanded={open}
        title="Drag to move"
        className={cn(
          'pointer-events-auto relative touch-none select-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
          dragging ? 'scale-105 cursor-grabbing' : 'cursor-grab transition-transform hover:-translate-y-0.5',
        )}
      >
        <Chameleon
          tone={tone}
          blinkKey={blink}
          className={cn('h-[72px] w-[72px] drop-shadow-[0_6px_12px_rgba(16,16,16,0.25)]', hop && 'animate-cham-hop motion-reduce:animate-none')}
        />
        {badge > 0 && (
          <span className="absolute right-0 top-0 grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1 text-[11px] font-semibold text-white ring-2 ring-canvas">
            {badge}
          </span>
        )}
      </button>
    </div>
  );
}
