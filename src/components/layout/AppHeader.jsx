import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/utils/format';

const LOGO_URL = `${import.meta.env.BASE_URL}changeflow-logo.svg`;

export default function AppHeader() {
  const { user } = useAuth();
  const name = user?.name || user?.uname || 'User';

  return (
    <header className="sticky top-0 z-40 flex h-[68px] items-center gap-4 bg-nav px-4">
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.07]" />

      <div className="flex min-w-0 items-center gap-3">
        <img src={LOGO_URL} alt="" className="h-[34px] w-[34px] shrink-0" />
        <span className="min-w-0 leading-none">
          <span className="block whitespace-nowrap text-[19px] font-bold tracking-[-0.4px] text-white">ChangeFlow</span>
          <span className="mt-1 hidden whitespace-nowrap text-[11px] font-medium tracking-[0.01em] text-nav-icon sm:block">
            ChangeFlow
          </span>
        </span>
      </div>

      <div className="ml-auto flex items-center gap-[9px] px-1.5 py-1">
        <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-brand/25 text-[11px] font-bold text-white ring-1 ring-inset ring-brand/60">
          {getInitials(name)}
        </span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block max-w-[180px] truncate text-[12px] font-semibold text-white">{name}</span>
          {user?.roleName && <span className="block truncate text-[10px] text-nav-icon">{user.roleName}</span>}
        </span>
      </div>
    </header>
  );
}
