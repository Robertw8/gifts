import { Outlet, useLocation } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { BalancePanel } from './BalancePanel';
import { BottomNav } from './BottomNav';

export function AppShell() {
  const location = useLocation();
  return (
    <div className="app-frame relative mx-auto min-h-[100dvh] max-w-[430px] overflow-x-hidden bg-[#111111] text-white shadow-[0_0_80px_rgba(0,0,0,0.55)]">
      <div className="sticky top-0 z-40 bg-[#0d1720]/98 backdrop-blur-xl">
        <AppHeader />
        <BalancePanel />
      </div>
      <main key={location.pathname} className="page-enter px-4 pb-[94px] pt-5">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
