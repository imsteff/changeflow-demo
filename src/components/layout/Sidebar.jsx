import { useLayoutEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import {
  ChevronLeft, ChevronRight, FilePlus, Files, Inbox, Moon, Sun, Ticket,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ROLES, canSubmit, isSaPm } from '@/constants/cr';
import { useAuth } from '@/context/AuthContext';
import { useSummary } from '@/context/SummaryContext';
import { useTheme } from '@/context/ThemeContext';
import usePersistentState from '@/hooks/usePersistentState';
import useMediaQuery from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import DemoMenu, { DemoIcon } from './DemoMenu';

const RAIL_W = 60;
const PANEL_W = 216;

const ITEM_BASE = 'group relative flex h-[42px] w-full items-center overflow-hidden rounded-[10px] text-left outline-none '
  + 'transition-[background-color,color] duration-200 ease-out '
  + 'focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-nav';
const ITEM_IDLE = 'text-nav-icon hover:bg-white/[0.06] hover:text-white active:bg-white/[0.10]';

const isActive = (to, pathname) => (to === '/' ? pathname === '/' : pathname.startsWith(to));

function RailTooltip({ label, expanded, children }) {
  if (expanded) return children;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={10}>{label}</TooltipContent>
    </Tooltip>
  );
}

function CountBadge({ count, expanded }) {
  if (!count) return null;
  const text = count > 99 ? '99+' : count;
  if (!expanded) {
    return (
      <span className="absolute right-[3px] top-[3px] flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
        {text}
      </span>
    );
  }
  return <span className="mr-[10px] rounded-full bg-brand px-1.5 text-[11px] font-bold leading-[18px] text-white">{text}</span>;
}

function ItemBody({ icon: Icon, label, expanded, active = false, count = 0 }) {
  return (
    <>
      <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center">
        <Icon
          className={cn(
            'h-[20px] w-[20px] transition-transform duration-200 ease-out',
            active ? 'scale-105' : 'group-hover:scale-110 group-active:scale-95',
          )}
        />
      </span>
      <span
        aria-hidden={!expanded}
        className={cn(
          'min-w-0 flex-1 truncate pr-[10px] text-[12.5px] transition-opacity duration-200 ease-out',
          active ? 'font-semibold' : 'font-medium',
          expanded ? 'opacity-100 delay-100' : 'opacity-0',
        )}
      >
        {label}
      </span>
      <CountBadge count={count} expanded={expanded} />
    </>
  );
}

function RailButton({ icon, label, expanded, ...props }) {
  return (
    <RailTooltip label={label} expanded={expanded}>
      <button type="button" aria-label={label} className={cn(ITEM_BASE, ITEM_IDLE)} {...props}>
        <ItemBody icon={icon} label={label} expanded={expanded} />
      </button>
    </RailTooltip>
  );
}

export default function Sidebar() {
  const { user } = useAuth();
  const { summary } = useSummary();
  const { theme, canToggle, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const wide = useMediaQuery('(min-width: 768px)');
  const [open, setOpen] = usePersistentState('crp.navExpanded', false);
  const expanded = open && wide;

  const showInbox = user?.role !== ROLES.REQUESTOR || summary?.waiting > 0 || pathname.startsWith('/inbox');
  const items = [
    ...(canSubmit(user) ? [
      { to: '/', icon: FilePlus, label: 'New Request' },
      { to: '/requests', icon: Files, label: 'My Requests', count: summary?.returned },
    ] : []),
    ...(showInbox ? [{ to: '/inbox', icon: Inbox, label: 'Inbox', count: summary?.waiting }] : []),
    ...(isSaPm(user) ? [{ to: '/req-tracker', icon: Ticket, label: 'REQ Tracker' }] : []),
  ];

  const refs = useRef({});
  const [rail, setRail] = useState({ y: 0, h: 0, show: false });
  const activeTo = items.find((i) => isActive(i.to, pathname))?.to;

  useLayoutEffect(() => {
    const el = activeTo && refs.current[activeTo];
    setRail(el ? { y: el.offsetTop, h: el.offsetHeight, show: true } : (r) => ({ ...r, show: false }));
  }, [activeTo, showInbox]);

  const toggleLabel = expanded ? 'Collapse menu' : 'Expand menu';
  const dark = theme === 'dark';

  return (
    <aside
      aria-label="Main navigation"
      className="sticky top-[68px] flex h-[calc(100vh-68px)] shrink-0 flex-col gap-[6px] bg-nav pb-3 pt-[28px] transition-[width] duration-300 ease-nav motion-reduce:transition-none"
      style={{ width: expanded ? PANEL_W : RAIL_W }}
    >
      <nav className="relative flex w-full flex-col gap-[6px] px-[9px]">
        <span
          aria-hidden
          className="absolute left-0 w-[3px] rounded-r-full bg-brand transition-[transform,opacity] duration-300 ease-nav motion-reduce:transition-none"
          style={{
            height: rail.h ? `${rail.h}px` : 0,
            transform: `translateY(${rail.y}px) scaleY(${rail.show ? 0.55 : 0})`,
            opacity: rail.show ? 1 : 0,
          }}
        />
        {items.map((item) => {
          const active = item.to === activeTo;
          return (
            <RailTooltip key={item.to} label={item.label} expanded={expanded}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                ref={(el) => { refs.current[item.to] = el; }}
                aria-label={item.count ? `${item.label}, ${item.count}` : item.label}
                className={cn(ITEM_BASE, active ? 'text-brand' : ITEM_IDLE)}
              >
                <ItemBody {...item} expanded={expanded} active={active} />
              </NavLink>
            </RailTooltip>
          );
        })}
      </nav>

        <div className="mt-auto flex w-full flex-col gap-[6px] px-[9px]">
          <DemoMenu expanded={expanded} itemClassName={cn(ITEM_BASE, ITEM_IDLE)}>
            <ItemBody icon={DemoIcon} label="Demo controls" expanded={expanded} />
          </DemoMenu>
          {canToggle && (
            <RailButton icon={dark ? Sun : Moon} label={dark ? 'Light mode' : 'Dark mode'} expanded={expanded} onClick={toggleTheme} />
          )}
          <div aria-hidden className="mx-[6px] my-[2px] h-px bg-nav-line" />
          {wide && (
            <RailButton
              icon={expanded ? ChevronLeft : ChevronRight}
              label={toggleLabel}
              expanded={expanded}
              aria-expanded={expanded}
              onClick={() => setOpen((v) => !v)}
            />
          )}
        </div>
    </aside>
  );
}
