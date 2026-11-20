import InfoHint from '@/components/common/InfoHint';
import { cn } from '@/lib/utils';

// for children: visible description, hint: info tooltip
export default function PageHeader({ title, hint, children }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-3', children ? 'mb-8' : 'mb-5')}>
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <h1 className={cn('font-semibold tracking-tight', children ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl')}>{title}</h1>
          {hint && <InfoHint side="right">{hint}</InfoHint>}
        </div>
        {children && <p className="text-sm text-muted-foreground">{children}</p>}
      </div>
    </div>
  );
}
