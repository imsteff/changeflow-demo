import { Check, CornerUpLeft, SkipForward, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { progressOf } from '@/utils/crProgress';

const DOT = {
  done: { className: 'bg-brand text-white', icon: Check },
  skipped: { className: 'bg-muted text-muted-foreground', icon: SkipForward },
  current: { className: 'bg-surface text-brand ring-2 ring-brand animate-step-pulse' },
  returned: { className: 'bg-orange-500 text-white', icon: CornerUpLeft },
  rejected: { className: 'bg-red-500 text-white', icon: X },
  upcoming: { className: 'bg-surface text-faint ring-1 ring-line' },
};

const NOTE = {
  done: (s) => s.actor,
  skipped: () => 'Skipped',
  current: (s) => (s.actor ? `Waiting for ${s.actor}` : 'In progress'),
  returned: (s) => (s.actor ? `Returned by ${s.actor}` : 'Returned'),
  rejected: (s) => (s.actor ? `Disapproved by ${s.actor}` : 'Disapproved'),
  upcoming: () => null,
};

const reached = (state) => state !== 'upcoming';

export default function CrProgress({ cr }) {
  const steps = progressOf(cr);
  return (
    // for the pulse ring spread
    <ol aria-label="Approval progress" className="flex overflow-x-auto pb-1 pt-3">
      {steps.map((s, i) => {
        const dot = DOT[s.state];
        const Icon = dot.icon;
        const note = NOTE[s.state](s);
        return (
          <li
            key={s.key}
            aria-current={s.state === 'current' ? 'step' : undefined}
            className="relative min-w-[112px] flex-1 px-1 text-center"
          >
            {i > 0 && (
              <span
                aria-hidden
                className={cn(
                  'absolute right-[calc(50%+18px)] top-[13px] h-0.5 w-[calc(100%-36px)]',
                  reached(s.state) ? 'bg-brand/60' : 'bg-line',
                )}
              />
            )}
            <span className={cn('relative mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold', dot.className)}>
              {Icon ? <Icon className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className={cn('mt-2 block text-xs font-semibold', reached(s.state) ? 'text-ink' : 'text-faint')}>{s.label}</span>
            {note && <span className="mt-0.5 block truncate text-[11px] text-muted-foreground" title={note}>{note}</span>}
            <span className="sr-only">{s.state}</span>
          </li>
        );
      })}
    </ol>
  );
}
