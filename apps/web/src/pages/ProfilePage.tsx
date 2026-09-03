import { Bell, ChevronRight, CircleHelp, Copy, LogOut, ReceiptText, ShieldCheck } from 'lucide-react';
import { TonIcon } from '../components/ui/TonIcon';
import { ProfileCard } from '../components/profile/ProfileCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ErrorState, LoadingState } from '../components/ui/AsyncState';
import { useBalance, useProfile } from '../features/marketplace/hooks';
import { formatTon } from '../lib/giftStyles';

export function ProfilePage() {
  const profile = useProfile();
  const balance = useBalance();
  if (profile.isLoading || balance.isLoading) return <LoadingState label="Loading profile…" />;
  if (profile.isError || balance.isError || !profile.data || !balance.data) return <ErrorState message="Your profile could not be loaded." onRetry={() => { void profile.refetch(); void balance.refetch(); }} />;
  const user = profile.data;
  const menu = [
    { icon: ReceiptText, label: 'Transaction history', detail: `${balance.data.transactions.length} entries` },
    { icon: Bell, label: 'Notifications', detail: '' },
    { icon: ShieldCheck, label: 'Security', detail: 'Telegram' },
    { icon: CircleHelp, label: 'Help & support', detail: '' },
  ];
  return (
    <div>
      <SectionHeader eyebrow="Account" title="Profile" />
      <ProfileCard />

      <section className="mt-3 rounded-[16px] bg-[#292929] p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">Internal balance</p>
        <div className="mt-2 flex items-center gap-2 text-[27px] font-black"><TonIcon size={28} /> {formatTon(balance.data.balance)}</div>
        <button type="button" onClick={() => void navigator.clipboard.writeText(user.telegramId)} className="mt-4 flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white/65"><Copy className="h-3.5 w-3.5" /> Telegram ID: {user.telegramId}</button>
      </section>

      <section className="mt-3 overflow-hidden rounded-[16px] bg-[#292929]">
        {menu.map(({ icon: Icon, label, detail }, index) => (
          <button key={label} type="button" className={`flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-white/[0.03] ${index ? 'border-t border-white/[0.06]' : ''}`}>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.05] text-white/55"><Icon className="h-[18px] w-[18px]" /></span>
            <span className="flex-1 text-sm font-bold">{label}</span>
            <span className="text-[10px] text-white/30">{detail}</span>
            <ChevronRight className="h-4 w-4 text-white/20" />
          </button>
        ))}
      </section>

      <button type="button" onClick={() => window.Telegram?.WebApp.close()} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-400/10 py-3.5 text-sm font-bold text-red-300"><LogOut className="h-4 w-4" /> Close Mini App</button>
    </div>
  );
}
