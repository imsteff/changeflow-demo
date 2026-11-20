import { CircleAlert, CircleCheck, Info, Loader2, TriangleAlert, X } from 'lucide-react';
import { Toaster as Sonner } from 'sonner';
import { useTheme } from '@/context/ThemeContext';

const ICONS = {
  success: <CircleCheck />,
  error: <TriangleAlert />,
  warning: <CircleAlert />,
  info: <Info />,
  loading: <Loader2 className="animate-spin" />,
  close: <X />,
};

// for every toast: top right, app palette (no `relative` here, sonner positions the toast itself)
function Toaster(props) {
  const { theme } = useTheme();
  return (
    <Sonner
      theme={theme}
      position="top-right"
      offset={16}
      gap={10}
      icons={ICONS}
      closeButton
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: 'flex w-[360px] max-w-[calc(100vw-32px)] items-start gap-3 overflow-hidden rounded-xl border border-line bg-surface py-3 pl-3.5 pr-9 font-sans shadow-[0_8px_28px_-6px_rgba(0,0,0,0.28)]',
          icon: 'mt-px flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand [&>svg]:h-4 [&>svg]:w-4',
          success: '[&_[data-icon]]:bg-emerald-500/10 [&_[data-icon]]:text-emerald-600 dark:[&_[data-icon]]:text-emerald-400',
          error: '[&_[data-icon]]:bg-danger/10 [&_[data-icon]]:text-danger-ink',
          warning: '[&_[data-icon]]:bg-amber-500/10 [&_[data-icon]]:text-amber-600 dark:[&_[data-icon]]:text-amber-400',
          content: 'min-w-0 flex-1',
          title: 'text-[13px] font-semibold leading-tight text-ink',
          description: 'mt-[3px] text-xs leading-snug text-subtle',
          closeButton: 'absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-md text-faint transition-colors hover:bg-canvas hover:text-ink [&>svg]:h-3.5 [&>svg]:w-3.5',
          actionButton: 'mt-2 text-xs font-semibold text-brand hover:text-brand-hover',
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
