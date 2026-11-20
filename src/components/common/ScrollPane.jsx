import * as React from 'react';
import { cn } from '@/lib/utils';

// for panes inside a fill page: scroll on their own on desktop, flow with the page on mobile
const ScrollPane = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('scrollbar-quiet lg:relative lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain', className)} {...props} />
));
ScrollPane.displayName = 'ScrollPane';

export default ScrollPane;
