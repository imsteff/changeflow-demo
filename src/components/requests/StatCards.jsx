import { CheckCircle2, CornerUpLeft, Hourglass, Inbox } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function StatCard({ icon: Icon, label, value, note }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-lg font-semibold text-ink">{value}</p>
        {note && <p className="truncate text-[11px] text-faint">{note}</p>}
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm">
      <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-12" />
      </div>
    </div>
  );
}

export default function StatCards({ summary }) {
  if (!summary) {
    return (
      <div aria-busy="true" aria-label="Loading summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <StatCardSkeleton key={i} />)}
      </div>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard icon={Inbox} label="Pending for you" value={summary.waiting} />
      <StatCard icon={CornerUpLeft} label="Returned to requestor" value={summary.returnedToRequestor ?? 0} note="Waiting for changes" />
      <StatCard icon={Hourglass} label="In progress" value={summary.inProgress ?? 0} note="Open CRs across all steps" />
      <StatCard icon={CheckCircle2} label="Approved this month" value={summary.approvedThisMonth ?? 0} />
    </div>
  );
}
