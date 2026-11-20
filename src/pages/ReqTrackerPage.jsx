import { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { List, Search, SquareKanban, Ticket } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadError from '@/components/common/LoadError';
import PageHeader from '@/components/common/PageHeader';
import Pager from '@/components/common/Pager';
import Page from '@/components/layout/Page';
import EmptyState from '@/components/requests/EmptyState';
import ReqBoard from '@/components/requests/ReqBoard';
import ReqTrackerList, { ReqTrackerSkeleton } from '@/components/requests/ReqTrackerList';
import { REQ_CATEGORIES, isSaPm } from '@/constants/cr';
import { useAuth } from '@/context/AuthContext';
import useAsync from '@/hooks/useAsync';
import useDebounce from '@/hooks/useDebounce';
import useUrlParams from '@/hooks/useUrlParams';
import { listReqs } from '@/services/crService';
import { timeAgo } from '@/utils/format';

const PAGE_SIZE = 20;
const ALL = REQ_CATEGORIES[0].value;
const VIEWS = [
  { value: 'board', label: 'Board', icon: SquareKanban },
  { value: 'list', label: 'List', icon: List },
];

function ViewToggle({ view, onChange }) {
  return (
    <Tabs value={view} onValueChange={onChange} className="md:ml-auto">
      <TabsList aria-label="View" className="h-9">
        {VIEWS.map(({ value, label, icon: Icon }) => (
          <TabsTrigger key={value} value={value} className="gap-1.5 text-xs">
            <Icon className="h-3.5 w-3.5" /> {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

function StatusFilter({ category, counts, onChange }) {
  return (
    <Select value={category} onValueChange={onChange}>
      <SelectTrigger aria-label="Jira status" className="h-9 md:w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {REQ_CATEGORIES.map((c) => (
          <SelectItem key={c.value} value={c.value}>
            {c.value === ALL ? 'All statuses' : c.label}
            {counts && ` (${counts[c.value]})`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ReqListView({
  q, category, page, onPage, onLoaded,
}) {
  const list = useAsync(() => listReqs({
    category, q, page, pageSize: PAGE_SIZE,
  }), [category, q, page]);

  const lastPage = list.data ? Math.max(1, Math.ceil(list.data.total / PAGE_SIZE)) : 1;

  // for a page past the end, e.g. an old link or fewer REQs since
  useEffect(() => {
    if (!list.data) return;
    if (page > lastPage) onPage(lastPage);
    else onLoaded(list.data);
  }, [list.data]);

  if (list.error && !list.data) return <div className="p-4"><LoadError title="Cannot load REQs" message={list.error} onRetry={list.reload} /></div>;
  if (!list.data || page > lastPage) return <ReqTrackerSkeleton />;

  const { items, total } = list.data;
  if (!items.length && (q || category !== ALL)) return <EmptyState icon={Search} title="No matches">No REQs match this search or status.</EmptyState>;
  if (!items.length) return <EmptyState icon={Ticket} title="No REQs yet">REQs show up here once a completed CR has one.</EmptyState>;

  return (
    <>
      <ReqTrackerList items={items} />
      <Pager page={page} pageSize={PAGE_SIZE} total={total} onPage={onPage} noun="REQs" className="border-t px-4 py-2" />
    </>
  );
}

function ReqTracker() {
  const [params, updateParams] = useUrlParams();
  const view = params.get('view') === 'list' ? 'list' : 'board';
  const category = REQ_CATEGORIES.find((c) => c.value === params.get('category'))?.value || ALL;
  const page = Math.max(1, Number.parseInt(params.get('page'), 10) || 1);
  const q = params.get('q') || '';
  const [text, setText] = useState(q);
  const search = useDebounce(text.trim());
  const [counts, setCounts] = useState(null);
  // for the footer: undefined until the first load
  const [syncedAt, setSyncedAt] = useState();

  useEffect(() => {
    if (q !== search) setText(q);
  }, [q]);

  useEffect(() => {
    if (search !== q) updateParams({ q: search, page: null }, { replace: true });
  }, [search]);

  const changeView = (value) => updateParams({ view: value === 'list' ? value : null, category: null, page: null });
  const onListLoaded = (data) => {
    setCounts(data.counts);
    setSyncedAt(data.syncedAt);
  };

  return (
    <>
      <PageHeader title="REQ Tracker" hint="Jira REQs of completed CRs and where they are now." />
      <section aria-label="REQs" className="overflow-hidden rounded-xl border bg-card shadow-sm lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
        <div className="flex flex-col gap-3 border-b p-3 md:flex-row md:items-center">
          <div className="relative md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Search CR no, REQ or title"
              aria-label="Search REQs"
              maxLength={60}
              className="h-9 pl-9"
            />
          </div>
          {view === 'list' && (
            <StatusFilter
              category={category}
              counts={counts}
              onChange={(value) => updateParams({ category: value === ALL ? null : value, page: null })}
            />
          )}
          <ViewToggle view={view} onChange={changeView} />
        </div>

        <div className="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
          {view === 'list' ? (
            <ReqListView
              q={q}
              category={category}
              page={page}
              onPage={(p) => updateParams({ page: p > 1 ? p : null })}
              onLoaded={onListLoaded}
            />
          ) : (
            <ReqBoard q={q} onSynced={setSyncedAt} />
          )}
        </div>

        {syncedAt !== undefined && (
          <p className="border-t px-4 py-2 text-xs text-muted-foreground">
            {syncedAt ? `Status from Jira, updated ${timeAgo(syncedAt)}` : 'Status not synced from Jira yet'}
          </p>
        )}
      </section>
    </>
  );
}

export default function ReqTrackerPage() {
  const { user } = useAuth();
  if (!isSaPm(user)) return <Navigate to="/" replace />;

  return (
    <Page fill>
      <ReqTracker />
    </Page>
  );
}
