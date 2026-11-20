import { CornerUpLeft } from 'lucide-react';
import { actorOf, lastReturn } from '@/utils/crProgress';
import { timeAgo } from '@/utils/format';

export default function ReturnedBanner({ cr }) {
  const event = cr.status === 'returned' ? lastReturn(cr) : null;
  if (!event) return null;
  return (
    <div className="flex gap-3 rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-500/30 dark:bg-orange-500/10 px-4 py-3">
      <CornerUpLeft className="mt-0.5 h-4 w-4 shrink-0 text-orange-600 dark:text-orange-400" />
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">
          Returned by {actorOf(event)}<span className="font-normal text-orange-700 dark:text-orange-300"> · {timeAgo(event.at)}</span>
        </p>
        {event.remarks && <p className="whitespace-pre-wrap break-words text-sm text-orange-900 dark:text-orange-100">{event.remarks}</p>}
      </div>
    </div>
  );
}
