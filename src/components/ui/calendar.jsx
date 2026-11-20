import { DayPicker, getDefaultClassNames } from 'react-day-picker';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

function Chevron({ orientation, className }) {
  const Icon = orientation === 'left' ? ChevronLeft : ChevronRight;
  return <Icon className={cn('h-4 w-4', className)} />;
}

function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
  const d = getDefaultClassNames();
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: cn(d.months, 'relative'),
        month: cn(d.month, 'space-y-4'),
        month_caption: cn(d.month_caption, 'flex h-7 items-center justify-center'),
        caption_label: cn(d.caption_label, 'text-sm font-medium'),
        nav: cn(d.nav, 'absolute inset-x-0 top-0 flex items-center justify-between'),
        button_previous: cn(buttonVariants({ variant: 'outline' }), 'h-7 w-7 p-0 opacity-60 hover:opacity-100'),
        button_next: cn(buttonVariants({ variant: 'outline' }), 'h-7 w-7 p-0 opacity-60 hover:opacity-100'),
        month_grid: cn(d.month_grid, 'w-full border-collapse'),
        weekdays: cn(d.weekdays, 'flex'),
        weekday: cn(d.weekday, 'w-9 text-[0.8rem] font-normal text-muted-foreground'),
        week: cn(d.week, 'mt-2 flex w-full'),
        day: cn(d.day, 'h-9 w-9 p-0 text-center text-sm'),
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal aria-selected:bg-primary aria-selected:text-primary-foreground',
        ),
        today: cn(d.today, 'font-semibold underline'),
        outside: cn(d.outside, 'text-muted-foreground opacity-50'),
        disabled: cn(d.disabled, 'text-muted-foreground opacity-40'),
        hidden: cn(d.hidden, 'invisible'),
        ...classNames,
      }}
      components={{ Chevron }}
      {...props}
    />
  );
}

export { Calendar };
