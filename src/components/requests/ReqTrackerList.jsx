import { Link, useNavigate } from 'react-router';
import { ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import StatusBadge from '@/components/requests/StatusBadge';
import { REQ_STATUS_STYLES, crTrackerLink, systemName } from '@/constants/cr';
import { formatDate } from '@/utils/format';
import { jiraDemoClick } from '@/utils/demoLinks';

const stopRowClick = jiraDemoClick;

function ReqStatus({ req }) {
  if (!req.status) return <span className="text-xs text-faint">Not synced</span>;
  return <StatusBadge status={req.statusCategory} label={req.status} styles={REQ_STATUS_STYLES} />;
}

function ReqTable({ items }) {
  const navigate = useNavigate();
  return (
    <Table wrapperClassName="scrollbar-quiet lg:h-full">
      <TableHeader className="sticky top-0 z-10 bg-card">
        <TableRow className="hover:bg-transparent">
          <TableHead>CR</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>REQ</TableHead>
          <TableHead>Jira Status</TableHead>
          <TableHead>Processor</TableHead>
          <TableHead>Completed</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((cr) => (
          <TableRow key={cr.crNo} className="cursor-pointer" onClick={() => navigate(crTrackerLink(cr.crNo))}>
            <TableCell className="whitespace-nowrap">
              <Link to={crTrackerLink(cr.crNo)} onClick={stopRowClick} className="font-semibold text-subtle hover:text-ink">{cr.crNo}</Link>
            </TableCell>
            <TableCell className="max-w-sm">
              <p className="truncate font-medium text-ink">{cr.title}</p>
              <p className="truncate text-xs text-muted-foreground">{systemName(cr)}</p>
            </TableCell>
            <TableCell className="whitespace-nowrap">
              <a
                href="#"
                onClick={stopRowClick}
                className="inline-flex items-center gap-1 font-semibold text-brand hover:underline"
              >
                {cr.req.key} <ExternalLink className="h-3 w-3" />
              </a>
            </TableCell>
            <TableCell><ReqStatus req={cr.req} /></TableCell>
            <TableCell className="whitespace-nowrap text-subtle">{cr.processor?.name}</TableCell>
            <TableCell className="whitespace-nowrap text-subtle">{formatDate(cr.processedAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function ReqCards({ items }) {
  return (
    <ul className="divide-y">
      {items.map((cr) => (
        <li key={cr.crNo}>
          <Link to={crTrackerLink(cr.crNo)} className="block px-4 py-3 outline-none hover:bg-muted/60 focus-visible:bg-muted">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-subtle">{cr.crNo} · {cr.req.key}</span>
              <ReqStatus req={cr.req} />
            </div>
            <p className="mt-1 line-clamp-2 text-sm font-medium text-ink">{cr.title}</p>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {cr.processor?.name} · Completed {formatDate(cr.processedAt)}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function ReqTrackerList({ items }) {
  return (
    <>
      <div className="hidden md:block lg:min-h-0 lg:flex-1"><ReqTable items={items} /></div>
      <div className="md:hidden"><ReqCards items={items} /></div>
    </>
  );
}

export function ReqTrackerSkeleton() {
  const rows = Array.from({ length: 6 }, (_, i) => i);
  return (
    <div aria-busy="true" aria-label="Loading REQs">
      <div className="hidden divide-y md:block">
        {rows.map((i) => (
          <div key={i} className="flex items-center gap-6 px-3 py-4">
            <Skeleton className="h-4 w-24" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
      <ul className="divide-y md:hidden">
        {rows.map((i) => (
          <li key={i} className="space-y-2 px-4 py-3">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-36" />
              <Skeleton className="h-4 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-44" />
          </li>
        ))}
      </ul>
    </div>
  );
}
