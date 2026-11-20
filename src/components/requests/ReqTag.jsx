import { Ticket } from 'lucide-react';
import StatusBadge from '@/components/requests/StatusBadge';
import { REQ_STATUS_STYLES } from '@/constants/cr';

export default function ReqTag({ req }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <Ticket aria-hidden className="h-3.5 w-3.5 shrink-0 text-brand" />
      <span className="text-xs font-semibold text-ink">{req.key}</span>
      {req.status && <StatusBadge status={req.statusCategory} label={req.status} styles={REQ_STATUS_STYLES} />}
    </span>
  );
}
