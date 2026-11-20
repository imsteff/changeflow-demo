import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadError from '@/components/common/LoadError';
import Pager from '@/components/common/Pager';
import ScrollPane from '@/components/common/ScrollPane';
import EmptyState from '@/components/requests/EmptyState';
import ReqTag from '@/components/requests/ReqTag';
import StatusBadge from '@/components/requests/StatusBadge';
import { systemName } from '@/constants/cr';
import { cn } from '@/lib/utils';
import { timeAgo } from '@/utils/format';

const TAB_COLS = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' };

const matches = (cr, text) => [cr.crNo, cr.title, cr.requestorName, systemName(cr), cr.statusLabel, cr.req?.key]
  .some((v) => String(v || '').toLowerCase().includes(text));

function CrListItem({ cr, to, selected }) {
  return (
    <li>
      <Link
        to={to}
        aria-current={selected ? 'page' : undefined}
        className={cn(
          'relative block px-4 py-3 outline-none transition-colors focus-visible:bg-muted',
          selected ? 'bg-brand-tint' : 'hover:bg-muted/60',
        )}
      >
        <span
          aria-hidden
          className={cn(
            'absolute inset-y-1.5 left-0 w-[5px] bg-brand transition-transform duration-200 ease-nav [clip-path:polygon(0_0,100%_5px,100%_calc(100%_-_5px),0_100%)]',
            selected ? 'scale-y-100' : 'scale-y-0',
          )}
        />
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-subtle">{cr.crNo}</span>
          <StatusBadge status={cr.status} label={cr.statusLabel} />
        </div>
        <p className="mt-1 line-clamp-2 text-sm font-medium text-ink">{cr.title}</p>
        {cr.req && <div className="mt-1.5"><ReqTag req={cr.req} /></div>}
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {systemName(cr)} · {cr.requestorName} · {timeAgo(cr.updatedAt)}
        </p>
      </Link>
    </li>
  );
}

function CrListSkeleton() {
  return (
    <ul aria-busy="true" aria-label="Loading requests" className="divide-y">
      {Array.from({ length: 5 }, (_, i) => (
        <li key={i} className="space-y-2 px-4 py-3">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-40" />
        </li>
      ))}
    </ul>
  );
}

export default function CrList({
  list, page, pageSize, onPage, linkTo, selectedCrNo, tabs, tab, onTab, empty,
}) {
  const [filter, setFilter] = useState('');
  const text = filter.trim().toLowerCase();
  const items = list.data?.items || [];
  const shown = text ? items.filter((cr) => matches(cr, text)) : items;
  const total = list.data?.total || 0;
  const reloadError = list.data ? list.error : '';

  useEffect(() => {
    if (reloadError) toast.error(reloadError);
  }, [reloadError]);

  let body;
  if (list.error && !list.data) body = <div className="p-4"><LoadError title="Cannot load requests" message={list.error} onRetry={list.reload} /></div>;
  else if (!list.data) body = <CrListSkeleton />;
  else if (!items.length) body = <EmptyState icon={empty.icon} title={empty.title}>{empty.text}</EmptyState>;
  else if (!shown.length) body = <EmptyState icon={Search} title="No matches">Nothing on this page matches “{filter.trim()}”.</EmptyState>;
  else {
    body = (
      <ul className="divide-y">
        {shown.map((cr) => <CrListItem key={cr.crNo} cr={cr} to={linkTo(cr.crNo)} selected={cr.crNo === selectedCrNo} />)}
      </ul>
    );
  }

  return (
    <section aria-label="Requests" className="flex min-h-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="space-y-3 border-b p-3">
        {tabs && (
          <Tabs value={tab} onValueChange={onTab}>
            <TabsList className={cn('grid w-full', TAB_COLS[tabs.length])}>
              {tabs.map((t) => <TabsTrigger key={t.value} value={t.value} className="text-xs">{t.label}</TabsTrigger>)}
            </TabsList>
          </Tabs>
        )}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by CR no, title, system, REQ"
            aria-label="Filter requests"
            className="h-9 pl-9"
          />
        </div>
      </div>

      <ScrollPane className="flex-1">{body}</ScrollPane>

      <Pager page={page} pageSize={pageSize} total={total} onPage={onPage} className="border-t px-3 py-2" />
    </section>
  );
}
