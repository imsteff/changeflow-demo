import { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STEPS } from '@/utils/crForm';

const SEGMENT_MS = 250;

const statusOf = (index, step, furthestStep) => {
  if (index === step) return 'current';
  if (index <= furthestStep) return 'visited';
  return 'upcoming';
};

// for the segment cascade
const segmentDelay = (i, from, to) => {
  if (to > from) return Math.max(0, i - from) * SEGMENT_MS;
  if (to < from) return Math.max(0, from - 1 - i) * SEGMENT_MS;
  return 0;
};

export default function CrStepper({ step, furthestStep, onSelect, disabled }) {
  const [move, setMove] = useState({ from: step, to: step });
  if (move.to !== step) setMove({ from: move.to, to: step });
  const { from } = move;
  const arrivalMs = Math.abs(step - from) * SEGMENT_MS;

  return (
    <nav aria-label="Form progress">
      <ol className="flex items-center gap-2 lg:hidden">
        {STEPS.map((s, i) => (
          <li
            key={s.key}
            aria-current={i === step ? 'step' : undefined}
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-border"
          >
            <span
              aria-hidden
              style={{ transitionDelay: `${segmentDelay(i - 1, from, step)}ms` }}
              className={cn(
                'block h-full w-full origin-left bg-primary transition-transform duration-300 ease-out motion-reduce:transition-none',
                i <= step ? 'scale-x-100' : 'scale-x-0',
              )}
            />
            <span className="sr-only">{s.title}</span>
          </li>
        ))}
      </ol>

      <ol className="hidden lg:block">
        {STEPS.map((s, i) => {
          const status = statusOf(i, step, furthestStep);
          const done = status === 'visited';
          const current = status === 'current';
          const delay = current && step !== from ? arrivalMs : 0;
          return (
            <li key={s.key} className="relative pb-8 last:pb-0">
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className={cn(
                    'absolute left-4 top-9 -ml-px h-[calc(100%-2.5rem)] w-0.5 overflow-hidden rounded-full',
                    i < furthestStep ? 'bg-primary/25' : 'bg-border',
                  )}
                >
                  <span
                    style={{ transitionDelay: `${segmentDelay(i, from, step)}ms` }}
                    className={cn(
                      'block h-full w-full origin-top bg-primary transition-transform duration-300 ease-in-out motion-reduce:transition-none',
                      i < step ? 'scale-y-100' : 'scale-y-0',
                    )}
                  />
                </span>
              )}
              <button
                type="button"
                disabled={status !== 'visited' || disabled}
                onClick={() => onSelect(i)}
                aria-current={current ? 'step' : undefined}
                className="group flex w-full items-start gap-3 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default"
              >
                <span className="relative flex h-8 w-8 shrink-0">
                  {current && (
                    <span
                      aria-hidden
                      style={{ animationDelay: `${delay}ms` }}
                      className="absolute inset-0 rounded-full motion-safe:animate-step-pulse"
                    />
                  )}
                  <span
                    style={{ transitionDelay: `${delay}ms`, animationDelay: `${delay}ms` }}
                    className={cn(
                      'relative flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors duration-300 motion-reduce:transition-none',
                      done && 'border-primary bg-primary text-primary-foreground group-enabled:group-hover:bg-primary/90',
                      current && 'border-primary bg-background text-primary motion-safe:animate-step-pop',
                      status === 'upcoming' && 'border-border bg-background text-muted-foreground',
                    )}
                  >
                    {done ? <Check className="h-4 w-4" /> : i + 1}
                  </span>
                </span>
                <span className="flex min-w-0 flex-col pt-1">
                  <span
                    className={cn(
                      'text-sm font-medium leading-tight transition-colors duration-300',
                      status === 'upcoming' ? 'text-muted-foreground' : 'text-foreground',
                      done && 'group-enabled:group-hover:underline',
                    )}
                  >
                    {s.title}
                  </span>
                  <span className="mt-0.5 text-xs text-muted-foreground">{s.summary}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
