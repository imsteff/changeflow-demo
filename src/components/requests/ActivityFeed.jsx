import { FIELD_LABELS, HISTORY_LABELS } from '@/constants/cr';
import { actorOf } from '@/utils/crProgress';
import { formatDateTime, getInitials, timeAgo } from '@/utils/format';

const changeLines = (changes) => {
  if (!changes) return [];
  const lines = [];
  const fields = Object.keys(changes).filter((k) => FIELD_LABELS[k]).map((k) => FIELD_LABELS[k]);
  if (fields.length) lines.push(`Changed ${fields.join(', ')}`);
  if (changes.attachmentsAdded?.length) lines.push(`Added ${changes.attachmentsAdded.join(', ')}`);
  if (changes.attachmentsRemoved?.length) lines.push(`Removed ${changes.attachmentsRemoved.join(', ')}`);
  const { reqKey, reqStatus, approvingOfficer } = changes;
  if (approvingOfficer) lines.push(`Approving officer changed from ${approvingOfficer.from || 'none'} to ${approvingOfficer.to || 'none'}`);
  if (reqKey) lines.push(reqKey.from ? `Changed REQ from ${reqKey.from} to ${reqKey.to}` : `REQ ticket: ${reqKey.to}`);
  if (reqStatus) lines.push(`${reqStatus.from} → ${reqStatus.to}`);
  if (changes.via === 'email') lines.push('Decided by email');
  return lines;
};

export default function ActivityFeed({ history }) {
  const events = [...(history || [])].reverse();
  return (
    <ol className="space-y-5">
      {events.map((h, i) => {
        const actor = actorOf(h);
        return (
          <li key={`${h.action}-${h.at}-${i}`} className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-subtle">
              {getInitials(actor || '?')}
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm">
                <span className="font-semibold">{actor}</span>{' '}
                <span className="text-muted-foreground">{HISTORY_LABELS[h.action] || h.action}</span>
                {h.revision > 1 && <span className="ml-1.5 text-[11px] text-faint">Rev {h.revision}</span>}
              </p>
              <time className="block text-xs text-faint" dateTime={h.at}>{formatDateTime(h.at)} · {timeAgo(h.at)}</time>
              {h.remarks && (
                <p className="whitespace-pre-wrap break-words rounded-md border bg-muted/40 px-3 py-2 text-sm">{h.remarks}</p>
              )}
              {changeLines(h.changes).map((line) => (
                <p key={line} className="break-words text-xs text-muted-foreground">{line}</p>
              ))}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
