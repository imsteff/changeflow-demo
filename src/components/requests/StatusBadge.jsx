import { STATUS_STYLES } from '@/constants/cr';
import { cn } from '@/lib/utils';

export default function StatusBadge({ status, label, className, styles = STATUS_STYLES }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset',
        styles[status] || 'bg-muted text-muted-foreground ring-border',
        className,
      )}
    >
      {label}
    </span>
  );
}
