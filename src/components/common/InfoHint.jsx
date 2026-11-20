import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function InfoHint({ children, side = 'top' }) {
  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        aria-label="More info"
        className="inline-flex cursor-help rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Info className="h-3.5 w-3.5" />
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs">{children}</TooltipContent>
    </Tooltip>
  );
}
