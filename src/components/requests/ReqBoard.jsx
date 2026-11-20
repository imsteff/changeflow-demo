import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ScrollPane from '@/components/common/ScrollPane';
import ReqTag from '@/components/requests/ReqTag';
import { REQ_CATEGORIES, crTrackerLink } from '@/constants/cr';
import useAsync from '@/hooks/useAsync';
import { listReqs } from '@/services/crService';
import { cn } from '@/lib/utils';

const COLUMNS = REQ_CATEGORIES.filter((c) => c.value !== 'all');
const COLUMN_PAGE_SIZE = 20;

function ReqCard({ cr }) {
  return (
    <Link
      to={crTrackerLink(cr.crNo)}
      className="block space-y-2 rounded-lg border bg-card p-3 shadow-sm outline-none transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
    >
      <p className="line-clamp-2 text-sm font-medium text-ink">{cr.title}</p>
      <ReqTag req={cr.req} />
      <p className="truncate text-xs text-muted-foreground">
        {cr.crNo}{cr.processor && ` · ${cr.processor.name}`}
      </p>
    </Link>
  );
}

function CardSkeletons() {
  return Array.from({ length: 3 }, (_, i) => (
    <div key={i} className="space-y-2 rounded-lg border bg-card p-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-3 w-36" />
    </div>
  ));
}

function ReqColumn({ column, q, onSynced }) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const res = useAsync(() => listReqs({
    category: column.value, q, page, pageSize: COLUMN_PAGE_SIZE,
  }), [page]);

  // for Show more: append the next page instead of replacing
  useEffect(() => {
    if (!res.data) return;
    // for rows that shifted pages between loads
    setItems((prev) => {
      if (page === 1) return res.data.items;
      const seen = new Set(prev.map((cr) => cr.crNo));
      return [...prev, ...res.data.items.filter((cr) => !seen.has(cr.crNo))];
    });
    setTotal(res.data.total);
    onSynced(res.data.syncedAt);
  }, [res.data]);

  const firstLoad = page === 1 && !res.data;

  let content;
  if (res.error && !items.length) content = <p className="px-1 text-xs text-destructive">Cannot load REQs. <button type="button" className="underline" onClick={res.reload}>Try again</button></p>;
  else if (firstLoad) content = <CardSkeletons />;
  else if (!items.length) content = <p className="px-1 py-6 text-center text-xs text-muted-foreground">No REQs</p>;
  else content = items.map((cr) => <ReqCard key={cr.crNo} cr={cr} />);

  return (
    <section aria-label={column.label} className="flex min-w-0 flex-col gap-2 rounded-xl bg-muted/60 p-2 lg:max-h-full">
      <h2 className="flex items-center gap-2 px-1 pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {column.label}
        {!firstLoad && <span className="rounded-full bg-background px-1.5 tabular-nums">{total}</span>}
      </h2>
      <ScrollPane className="-m-0.5 flex flex-col gap-2 rounded-lg p-0.5">{content}</ScrollPane>
      {res.error && items.length > 0 && (
        <p className="px-1 text-xs text-destructive">Cannot load more. <button type="button" className="underline" onClick={res.reload}>Try again</button></p>
      )}
      {!res.error && items.length < total && (
        <Button
          variant="ghost"
          size="sm"
          className={cn('text-xs text-muted-foreground', res.loading && 'pointer-events-none opacity-60')}
          onClick={() => setPage((p) => p + 1)}
        >
          {res.loading ? 'Loading...' : `Show more (${total - items.length})`}
        </Button>
      )}
    </section>
  );
}

// for the Jira-style view: one column per Jira status category
export default function ReqBoard({ q, onSynced }) {
  return (
    <div className="grid items-start gap-3 p-3 md:grid-cols-3 lg:min-h-0 lg:flex-1">
      {COLUMNS.map((column) => <ReqColumn key={`${column.value}:${q}`} column={column} q={q} onSynced={onSynced} />)}
    </div>
  );
}
