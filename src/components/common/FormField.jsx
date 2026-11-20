import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import InfoHint from './InfoHint';

export const describedByOf = (id, { error, hint, counter } = {}) => [
  (error || hint) && `${id}-message`,
  counter && `${id}-counter`,
].filter(Boolean).join(' ') || undefined;

export const invalidProps = (id, error, { hint, counter } = {}) => {
  const describedBy = describedByOf(id, { error, hint, counter });
  return {
    ...(error && { 'aria-invalid': true }),
    ...(describedBy && { 'aria-describedby': describedBy }),
  };
};

export default function FormField({ id, label, required, hint, tip, error, counter, children }) {
  const message = error || hint;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Label id={`${id}-label`} htmlFor={id}>
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </Label>
        {tip && <InfoHint>{tip}</InfoHint>}
      </div>
      {children}
      {(message || counter) && (
        <div className="flex items-start justify-between gap-4 text-xs">
          <p id={`${id}-message`} className={cn(error ? 'text-destructive' : 'text-muted-foreground')}>
            {message}
          </p>
          {counter && <span id={`${id}-counter`} className="shrink-0 tabular-nums text-muted-foreground">{counter}</span>}
        </div>
      )}
    </div>
  );
}
