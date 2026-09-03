import { BadgeDollarSign, Box, House, Trophy, UsersRound } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { haptic } from '../../features/auth/telegram';

const navItems = [
  { to: '/inventory', label: 'Backpack', icon: Box },
  { to: '/profile', label: 'Invite', icon: UsersRound },
  { to: '/', label: 'Home', icon: House },
  { to: '/gifts', label: 'Leaderboard', icon: Trophy },
  { to: '/activity', label: 'Earn', icon: BadgeDollarSign, badge: 21 },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto h-[76px] max-w-[430px] border-t border-[#333439] bg-[#1d1d1d]/98 px-1 pb-[max(5px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
      <div className="grid grid-cols-5">
        {navItems.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={() => haptic('light')}
            className={({ isActive }) => `nav-item relative mx-auto flex h-[59px] w-full max-w-[65px] min-w-0 flex-col items-center justify-center gap-1 rounded-[13px] text-[12px] font-semibold transition ${isActive ? 'active bg-[#8068df] text-white shadow-[0_8px_18px_rgba(82,55,180,.35)]' : 'text-[#a1a1a1]'}`}
          >
            <span className="relative"><Icon className="h-[23px] w-[23px]" strokeWidth={2.1} />{badge ? <span className="absolute -right-3 -top-2 rounded-full bg-[#f04b4e] px-1.5 py-0.5 text-[9px] font-extrabold leading-none text-white">{badge}</span> : null}</span>
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
