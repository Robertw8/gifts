import { Gem, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import { haptic } from '../../features/auth/telegram';
import { useBalance } from '../../features/marketplace/hooks';
import { formatTon } from '../../lib/giftStyles';
import { TonIcon } from '../ui/TonIcon';

export function BalancePanel() {
  const balance = useBalance();
  return (
    <section className="flex h-[70px] items-center justify-between gap-3 rounded-t-[12px] border-b border-[#3a3c42] bg-[#202020] px-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="balance-orb relative grid h-[46px] w-[46px] shrink-0 place-items-center rounded-full border-2 border-[#8d6cef] bg-[#171717]">
          <span className="text-[22px] opacity-80">🌌</span>
          <span className="absolute -bottom-1 -right-1 grid h-[21px] w-[21px] place-items-center rounded-full border-2 border-[#202020] bg-[#292929] text-[#c6c6c6]"><Gem className="h-[11px] w-[11px]" fill="currentColor" /></span>
        </div>
        <div className="min-w-0">
          <p className="text-[12px] font-semibold leading-none text-[#989898]">Internal balance</p>
          <div className="mt-1.5 flex items-center gap-1.5 text-[21px] font-extrabold leading-none tracking-[-0.02em]">
            <TonIcon size={24} /> {balance.data ? formatTon(balance.data.balance) : '—'}
          </div>
        </div>
      </div>
      <Link
        to="/top-up"
        onClick={() => haptic('medium')}
        className="flex h-[36px] shrink-0 items-center gap-2 rounded-[13px] bg-[#8269df] px-4 text-[15px] font-bold text-white shadow-[0_8px_20px_rgba(0,0,0,.28)] transition hover:brightness-110 active:scale-95"
      >
        <WalletCards className="h-[17px] w-[17px]" /> Deposit
      </Link>
    </section>
  );
}
