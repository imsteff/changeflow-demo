import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { ACTIONS } from '@/constants/cr';
import { cn } from '@/lib/utils';

const HINTS = {
  approve: 'Review the details below, then approve or disapprove.',
  accept: 'Review the details below, then accept or return it to the requestor.',
  resubmit: 'SA/PM returned this CR. Update it and resubmit.',
  claim: 'Fully approved. Start processing to create or link its REQ.',
  enter_req: 'Create the REQ in Jira or link an existing one to complete this CR.',
};

// for button order: primary last
const byWeight = (a, b) => Number(Boolean(ACTIONS[a]?.primary)) - Number(Boolean(ACTIONS[b]?.primary));

export default function ActionBar({ actions, onAction, editTo }) {
  const known = (actions || []).filter((action) => ACTIONS[action]);
  if (!known.length) return null;
  const hint = HINTS[known.find((action) => HINTS[action])];
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-brand-line bg-brand-tint px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-ink">Waiting for you</p>
        {hint && <p className="text-xs text-subtle">{hint}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {[...known].sort(byWeight).map((action) => {
          const { label, primary, danger } = ACTIONS[action];
          const className = cn(
            'min-w-24 flex-1 sm:flex-none',
            danger && 'text-destructive hover:bg-destructive/10 hover:text-destructive',
          );
          if (action === 'resubmit') {
            return (
              <Button key={action} asChild size="sm" className={className}>
                <Link to={editTo}>Edit &amp; Resubmit</Link>
              </Button>
            );
          }
          return (
            <Button key={action} size="sm" variant={primary ? 'default' : 'outline'} className={className} onClick={() => onAction(action)}>
              {label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
