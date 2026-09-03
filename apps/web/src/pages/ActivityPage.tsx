import { ChevronRight, Clock3, ReceiptText } from 'lucide-react';
import { TonIcon } from '../components/ui/TonIcon';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ErrorState, LoadingState } from '../components/ui/AsyncState';
import { useOrders } from '../features/marketplace/hooks';

export function ActivityPage() {
  const orders = useOrders();
  if (orders.isLoading) return <LoadingState label="Loading activity…" />;
  if (orders.isError) return <ErrorState message={orders.error instanceof Error ? orders.error.message : 'Activity is unavailable.'} onRetry={() => void orders.refetch()} />;
  const items = orders.data ?? [];
  return (
    <div>
      <SectionHeader eyebrow="Purchase history" title="Earn & activity" />
      <p className="-mt-1 text-[12px] text-[#8f8f8f]">Your recent marketplace activity.</p>

      <div className="mt-6 space-y-3">
        {items.map((order) => (
          <article key={order.id} className="flex items-center gap-3 rounded-[16px] bg-[#292929] p-3">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/[0.05] text-3xl">{order.gift.artwork}</div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-extrabold">{order.gift.name}</h2>
              <p className="mt-1 flex items-center gap-1.5 text-[10px] text-white/35"><Clock3 className="h-3 w-3" /> {new Date(order.createdAt).toLocaleDateString()} · Purchased</p>
            </div>
            <div className="text-right"><p className="flex items-center gap-1 text-sm font-extrabold"><TonIcon size={16} /> {order.amount}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-mint">{order.status}</p></div>
            <ChevronRight className="h-4 w-4 text-white/20" />
          </article>
        ))}
      </div>

      {!items.length ? <div className="mt-6 rounded-[24px] bg-white/[0.035] p-5 text-center">
        <ReceiptText className="mx-auto h-6 w-6 text-white/25" />
        <p className="mt-3 text-xs leading-relaxed text-white/35">New transactions will show up here automatically.</p>
      </div> : null}
    </div>
  );
}
