import { ArrowLeft, Gift, MoreHorizontal, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const showBack = location.pathname === '/top-up' || location.pathname.startsWith('/gifts/');
  return (
    <header className="flex h-[48px] items-center px-4 pt-[env(safe-area-inset-top)]">
      <button
        type="button"
        onClick={() => showBack ? navigate(-1) : window.Telegram?.WebApp.close()}
        aria-label={showBack ? 'Go back' : 'Close app'}
        className="-ml-1 grid h-9 w-9 place-items-center rounded-full text-white transition hover:bg-white/5"
      >
        {showBack ? <ArrowLeft className="h-[25px] w-[25px]" strokeWidth={2} /> : <X className="h-[25px] w-[25px]" strokeWidth={2} />}
      </button>
      <Link to="/" className="ml-5 flex h-[38px] items-center gap-2.5 rounded-[11px] bg-[#16202c] pl-2 pr-3.5">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#111722] text-[#8d62ff]"><Gift className="h-[17px] w-[17px]" fill="currentColor" /></span>
        <span className="text-[14px] font-medium tracking-[-0.01em]">Luma Gifts</span>
      </Link>
      <button type="button" aria-label="More options" className="ml-auto grid h-9 w-9 place-items-center text-white">
        <MoreHorizontal className="h-6 w-6" strokeWidth={3.2} />
      </button>
    </header>
  );
}
