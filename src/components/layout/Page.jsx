import { cn } from '@/lib/utils';

// for fill: panes scroll, not the window
export default function Page({ fill = false, className, children }) {
  return (
    <div className={cn('mx-auto max-w-[1720px]', fill && 'lg:flex lg:h-[calc(100vh-68px-4rem)] lg:flex-col', className)}>
      {children}
    </div>
  );
}
