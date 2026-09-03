import { Box, Plus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GiftCard } from '../components/gifts/GiftCard';
import { TelegramOwnedGiftCard } from '../components/gifts/TelegramOwnedGiftCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ErrorState, LoadingState } from '../components/ui/AsyncState';
import { useInventory, useTelegramOwnedGifts } from '../features/marketplace/hooks';
import { formatTon } from '../lib/giftStyles';

export function InventoryPage() {
  const inventory = useInventory();
  const telegramGifts = useTelegramOwnedGifts();
  if (inventory.isLoading || telegramGifts.isLoading) return <LoadingState label="Loading your gifts…" />;
  if (inventory.isError || telegramGifts.isError) return <ErrorState message={inventory.error instanceof Error ? inventory.error.message : telegramGifts.error instanceof Error ? telegramGifts.error.message : 'Inventory is unavailable.'} onRetry={() => { void inventory.refetch(); void telegramGifts.refetch(); }} />;
  const items = inventory.data ?? [];
  const ownedTelegramGifts = telegramGifts.data?.items ?? [];
  const collectionValue = items.reduce((total, item) => total + Number(item.purchasedPrice), 0);
  return (
    <div>
      <SectionHeader eyebrow="Your collection" title="Backpack" />
      <p className="-mt-1 text-[12px] text-[#8f8f8f]">Gifts you own, all in one place.</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-[16px] bg-[#292929] p-4"><Box className="h-5 w-5 text-[#9279eb]" /><p className="mt-3 text-2xl font-black">{items.length + ownedTelegramGifts.length}</p><p className="mt-1 text-[11px] text-[#929292]">Owned gifts</p></div>
        <div className="rounded-[16px] bg-[#292929] p-4"><Sparkles className="h-5 w-5 text-amber-300" /><p className="mt-3 text-xl font-black">{formatTon(collectionValue)}</p><p className="mt-1 text-[11px] text-[#929292]">Collection value</p></div>
      </div>

      {ownedTelegramGifts.length || items.length ? (
        <div className="mt-6 space-y-6">
          {ownedTelegramGifts.length ? <section><p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#9d88ee]">TELEGRAM · Owned gifts</p><div className="grid grid-cols-2 gap-3">{ownedTelegramGifts.map((gift) => <TelegramOwnedGiftCard key={gift.id} gift={gift} />)}</div></section> : null}
          {items.length ? <section><p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.15em] text-white/40">INTERNAL · Marketplace inventory</p><div className="grid grid-cols-2 gap-3">{items.map((item) => <GiftCard key={item.id} gift={item.gift} />)}</div></section> : null}
        </div>
      ) : (
        <div className="mt-6 rounded-[30px] border border-dashed border-white/10 px-6 py-16 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-violet/10 text-violet"><Box className="h-8 w-8" /></div>
          <h2 className="mt-5 text-xl font-extrabold">Your collection starts here</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/40">Pick a limited gift from the marketplace and it will appear here.</p>
          <Link to="/gifts" className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-violet px-5 py-3 text-sm font-extrabold"><Plus className="h-4 w-4" /> Browse gifts</Link>
        </div>
      )}
    </div>
  );
}
