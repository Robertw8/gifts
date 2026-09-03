import { ArrowLeft, BriefcaseBusiness, Gift, Star, WalletCards } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TonIcon } from '../components/ui/TonIcon';
import { haptic } from '../features/auth/telegram';
import { useConfirmStarsPayment, useCreateStarsInvoice } from '../features/marketplace/hooks';

const methods = [
  { id: 'ton', label: 'TON', icon: WalletCards, hot: false },
  { id: 'crypto', label: 'Other Crypto', icon: BriefcaseBusiness, hot: false },
  { id: 'stars', label: 'Stars', icon: Star, hot: true },
  { id: 'gifts', label: 'Gifts', icon: Gift, hot: false },
] as const;

export function TopUpPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState<(typeof methods)[number]['id']>('stars');
  const invoice = useCreateStarsInvoice();
  const confirmPayment = useConfirmStarsPayment();

  const startTopUp = () => {
    haptic('medium');
    if (active !== 'stars') return;
    invoice.mutate(100, {
      onSuccess: (created) => {
        window.Telegram?.WebApp.openInvoice(created.invoiceUrl, (status) => {
          if (status !== 'paid') return;
          confirmPayment.mutate(created.paymentId, {
            onSuccess: (payment) => {
              if (payment.status === 'PAID') window.Telegram?.WebApp.HapticFeedback?.notificationOccurred('success');
            },
          });
        });
      },
    });
  };
  return (
    <div className="min-h-[490px]">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back" className="grid h-[41px] w-[41px] place-items-center rounded-[12px] bg-[#353535] text-white"><ArrowLeft className="h-[22px] w-[22px]" /></button>
        <h1 className="text-[26px] font-extrabold tracking-[-0.025em]">Top Up Balance</h1>
      </div>

      <div className="mt-6 grid h-[80px] grid-cols-4 rounded-[13px] bg-[#353535] p-1">
        {methods.map(({ id, label, icon: Icon, hot }) => (
          <button key={id} type="button" onClick={() => { setActive(id); haptic(); }} className={`relative flex min-w-0 flex-col items-center justify-center gap-2 rounded-[10px] text-[12px] font-bold transition ${active === id ? 'bg-[#8068dd] text-white' : 'text-[#b7b7b7]'}`}>
            {hot ? <span className="absolute -top-1 rounded-full bg-[#ff9d17] px-1.5 py-0.5 text-[8px] font-black leading-none text-white shadow-[0_0_10px_#ff9d17]">HOT</span> : null}
            <Icon className="h-[20px] w-[20px]" />
            <span className="whitespace-nowrap">{label}</span>
          </button>
        ))}
      </div>

      <button type="button" disabled={invoice.isPending || confirmPayment.isPending} onClick={startTopUp} className="mx-auto mt-6 flex h-[41px] items-center gap-2 rounded-full bg-[#10a9e9] px-5 text-[16px] font-bold text-white shadow-[0_10px_24px_rgba(0,0,0,.25)] active:scale-95 disabled:opacity-60">
        {active === 'stars' ? <Star className="h-[21px] w-[21px]" fill="currentColor" /> : <TonIcon size={21} />}
        {active === 'stars' ? invoice.isPending ? 'Creating invoice…' : confirmPayment.isPending ? 'Confirming payment…' : 'Top up 100 Stars' : 'Connect Wallet'}
      </button>
      {active === 'stars' ? <p className="mx-auto mt-3 max-w-[290px] text-center text-[11px] leading-5 text-white/35">Telegram Stars fund your internal marketplace balance. The displayed balance is not your Telegram Stars wallet balance.</p> : null}
      {invoice.isError || confirmPayment.isError ? <p className="mx-auto mt-3 max-w-[300px] text-center text-[11px] text-red-300">{invoice.error instanceof Error ? invoice.error.message : confirmPayment.error instanceof Error ? confirmPayment.error.message : 'Payment failed'}</p> : null}
      {confirmPayment.data?.status === 'PAID' ? <p className="mt-3 text-center text-[12px] font-bold text-emerald-300">Balance updated successfully</p> : null}
    </div>
  );
}
