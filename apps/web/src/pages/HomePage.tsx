import { Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GiftCarousel } from '../components/gifts/GiftCarousel';
import { GiftCard } from '../components/gifts/GiftCard';
import { CategoryGrid } from '../components/home/CategoryCard';
import { PromoBanner } from '../components/home/PromoBanner';
import { ErrorState, LoadingState } from '../components/ui/AsyncState';
import { SectionHeader } from '../components/ui/SectionHeader';
import { TonIcon } from '../components/ui/TonIcon';
import { useHome } from '../features/marketplace/hooks';

export function HomePage() {
  const home = useHome();
  if (home.isLoading) return <LoadingState label="Loading marketplace…" />;
  if (home.isError || !home.data) return <ErrorState message={home.error instanceof Error ? home.error.message : 'The marketplace is unavailable.'} onRetry={() => void home.refetch()} />;
  const data = home.data;

  return (
    <div className="space-y-3.5">
      <GiftCarousel gifts={data.featuredGifts} />
      {data.banners.map((banner) => <PromoBanner key={banner.id} banner={banner} />)}
      <CategoryGrid categories={data.categories} />

      <section className="pt-3">
        <SectionHeader eyebrow="Marketplace" title="Popular gifts" action={<Link to="/gifts?sort=popular" className="text-[11px] font-bold text-[#9d88ee]">View all</Link>} />
        <div className="grid grid-cols-2 gap-3">{data.popularGifts.slice(0, 4).map((gift) => <GiftCard key={gift.id} gift={gift} />)}</div>
      </section>

      {data.recentActivity.length ? (
        <section className="pt-3">
          <SectionHeader eyebrow="Your account" title="Recent activity" />
          <div className="space-y-2">
            {data.recentActivity.map((order) => (
              <article key={order.id} className="flex items-center gap-3 rounded-[15px] bg-[#292929] p-3">
                <span className="grid h-11 w-11 place-items-center rounded-[12px] bg-white/5 text-2xl">{order.gift.artwork}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-[13px] font-bold">{order.gift.name}</p><p className="mt-1 flex items-center gap-1 text-[10px] text-white/35"><Clock3 className="h-3 w-3" /> {new Date(order.createdAt).toLocaleDateString()}</p></div>
                <span className="flex items-center gap-1 text-[12px] font-extrabold"><TonIcon size={15} /> {order.amount}</span>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
