import { Link } from 'react-router';
import { ArrowRight, Inbox } from 'lucide-react';
import { useSummary } from '@/context/SummaryContext';

export default function InboxBanner() {
  const { summary } = useSummary();
  const waiting = summary?.waiting || 0;
  if (!waiting) return null;
  return (
    <div className="mb-6 flex flex-col gap-2 rounded-lg border border-brand-line bg-brand-tint px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-center gap-2 text-sm font-medium text-ink">
        <Inbox className="h-4 w-4 text-brand" />
        {waiting} {waiting === 1 ? 'CR is' : 'CRs are'} waiting for your action
      </p>
      <Link to="/inbox" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-hover hover:underline">
        Go to Inbox <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
