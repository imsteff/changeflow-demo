import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Check, Mail, RotateCcw, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PERSONAS, getPersonaId, setPersona } from '@/mockData/demoAuth';
import { emailStageCrs, resetDemo } from '@/mockData/store';
import { cn } from '@/lib/utils';

const HOME = { requestor: '/', 'sa-pm': '/inbox', 'general-manager': '/inbox' };
const PREFERRED_STAGE = { requestor: 'pending_ao', 'sa-pm': 'pending_sapm', 'general-manager': 'pending_final' };
const ROW = 'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

// for the portfolio demo: persona switch, email link and data reset
export default function DemoMenu({ expanded, itemClassName, children }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const current = getPersonaId();

  const openEmailLink = () => {
    const crs = emailStageCrs();
    const inView = /\/(?:inbox|requests)\/(CR-\d{4}-\d+)/.exec(pathname)?.[1];
    const pick = crs.find((c) => c.crNo === inView)
      || crs.find((c) => c.status === PREFERRED_STAGE[current])
      || crs[0];
    setOpen(false);
    if (!pick) {
      toast.info('No CR is waiting on an email decision right now');
      return;
    }
    navigate(`/decide/${pick.token}`);
  };

  const reset = () => {
    resetDemo();
    window.location.reload();
  };

  const trigger = (
    <PopoverTrigger asChild>
      <button type="button" aria-label="Demo controls" className={itemClassName}>
        {children}
      </button>
    </PopoverTrigger>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {expanded ? trigger : (
        <Tooltip>
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={10}>Demo controls</TooltipContent>
        </Tooltip>
      )}
      <PopoverContent side="right" align="end" sideOffset={12} className="w-64 p-2">
        <p className="px-2 pb-1 pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">View as</p>
        {Object.values(PERSONAS).map((p) => (
          <button key={p.id} type="button" className={ROW} onClick={() => setPersona(p.id, HOME[p.id])}>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{p.label}</span>
              <span className="block truncate text-xs text-muted-foreground">{p.name}</span>
            </span>
            <Check className={cn('h-4 w-4 text-brand', p.id !== current && 'invisible')} />
          </button>
        ))}
        <div className="my-2 h-px bg-border" />
        <button type="button" className={ROW} onClick={openEmailLink}>
          <Mail className="h-4 w-4 text-muted-foreground" />
          Open email decision link
        </button>
        <button type="button" className={ROW} onClick={reset}>
          <RotateCcw className="h-4 w-4 text-muted-foreground" />
          Reset demo data
        </button>
      </PopoverContent>
    </Popover>
  );
}

export { Users as DemoIcon };
