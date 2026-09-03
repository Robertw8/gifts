import { Check, ChevronRight, Clock3, Gem, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { GiftArtwork } from '../components/ui/GiftArtwork';
import { TonIcon } from '../components/ui/TonIcon';
import { haptic } from '../features/auth/telegram';
import { useGift } from '../features/gifts/hooks';
import { useBuyGift } from '../features/marketplace/hooks';
import { rarityStyles } from '../lib/giftStyles';

export function GiftDetailsPage() {
  const { giftId } = useParams();
  const { data: gift, isLoading, isError } = useGift(giftId);
  const purchase = useBuyGift();

  if (isLoading) return <div className="h-[560px] animate-pulse rounded-[30px] bg-white/[0.05]" />;
  if (isError || !gift) return <div className="py-20 text-center text-white/50">This gift is no longer available.</div>;
  const rarity = rarityStyles[gift.rarity];
  const soldPercentage = Math.round(((gift.supply - gift.available) / gift.supply) * 100);

  const buy = () => {
    haptic('heavy');
    purchase.mutate(gift.id, { onSuccess: () => window.Telegram?.WebApp.HapticFeedback?.notificationOccurred('success') });
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#242424]">
        <GiftArtwork gift={gift} size="hero" />
      </div>

      <section>
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em]" style={{ color: rarity.accent }}><Sparkles className="h-3.5 w-3.5" /> {rarity.label}</span>
            <h1 className="mt-1.5 text-[32px] font-black leading-none tracking-[-0.04em]">{gift.name}</h1>
          </div>
          <div className="rounded-[12px] bg-[#2b2b2b] px-3 py-2 text-right">
            <p className="text-[9px] font-bold uppercase tracking-wider text-white/30">Floor price</p>
            <p className="mt-1 flex items-center gap-1.5 text-lg font-black">{gift.source === 'TELEGRAM' ? <Star className="h-5 w-5" fill="currentColor" /> : <TonIcon size={20} />} {gift.price}</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-white/48">{gift.description}</p>
      </section>

      <section className="rounded-[16px] bg-[#292929] p-4">
        <div className="grid grid-cols-3 divide-x divide-white/[0.07] text-center">
          <div><Gem className="mx-auto h-4 w-4 text-violet" /><p className="mt-2 text-sm font-extrabold">{gift.supply.toLocaleString()}</p><p className="mt-0.5 text-[10px] text-white/35">Total supply</p></div>
          <div><Clock3 className="mx-auto h-4 w-4 text-amber-300" /><p className="mt-2 text-sm font-extrabold">{gift.available.toLocaleString()}</p><p className="mt-0.5 text-[10px] text-white/35">Available</p></div>
          <div><ShieldCheck className="mx-auto h-4 w-4 text-mint" /><p className="mt-2 text-sm font-extrabold">Verified</p><p className="mt-0.5 text-[10px] text-white/35">Collection</p></div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-gradient-to-r from-violet to-fuchsia-400" style={{ width: `${soldPercentage}%` }} /></div>
        <p className="mt-2 text-right text-[10px] font-semibold text-white/35">{soldPercentage}% collected</p>
      </section>

      {purchase.isError ? <p className="rounded-[12px] bg-red-400/10 px-4 py-3 text-xs font-semibold text-red-300">{purchase.error instanceof Error ? purchase.error.message : 'Purchase failed'}</p> : null}
      <button type="button" onClick={buy} disabled={purchase.isPending || purchase.isSuccess || gift.available < 1} className={`flex w-full items-center justify-between rounded-[14px] px-5 py-4 text-base font-extrabold shadow-glow transition active:scale-[0.98] disabled:cursor-not-allowed ${purchase.isSuccess ? 'bg-emerald-400 text-emerald-950' : 'bg-[#8269df] text-white disabled:opacity-60'}`}>
        <span className="flex items-center gap-2">{purchase.isSuccess ? <><Check className="h-5 w-5" /> {gift.source === 'TELEGRAM' ? 'Sent to Telegram' : 'Added to collection'}</> : purchase.isPending ? 'Processing purchase…' : <>Buy now <span className="text-white/55">•</span> {gift.source === 'TELEGRAM' ? <Star className="h-5 w-5" fill="currentColor" /> : <TonIcon size={20} />} {gift.price}</>}</span>
        {!purchase.isSuccess && !purchase.isPending ? <ChevronRight className="h-5 w-5" /> : null}
      </button>
    </div>
  );
}
