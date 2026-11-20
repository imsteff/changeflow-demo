import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Pager({
  page, pageSize, total, onPage, className, noun = 'CRs',
}) {
  if (total <= pageSize) return null;
  const pages = Math.ceil(total / pageSize);

  return (
    <div className={cn('flex items-center justify-between gap-3 text-xs text-muted-foreground', className)}>
      <span>Page {page} of {pages} · {total} {noun}</span>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Previous page">
          <ChevronLeft />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onPage(page + 1)} disabled={page >= pages} aria-label="Next page">
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
