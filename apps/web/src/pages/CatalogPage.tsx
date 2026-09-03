import type { GiftRarity } from '@gifts/types';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FilterBar } from '../components/gifts/FilterBar';
import { GiftCard } from '../components/gifts/GiftCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ErrorState } from '../components/ui/AsyncState';
import { useGifts } from '../features/gifts/hooks';

export function CatalogPage() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [rarity, setRarity] = useState<GiftRarity | 'ALL'>('ALL');
  const [sort, setSort] = useState<'featured' | 'popular' | 'price-asc' | 'price-desc' | 'newest'>(() => searchParams.get('sort') === 'popular' ? 'popular' : 'featured');
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const category = searchParams.get('category') ?? undefined;
  const catalog = useGifts({ search, rarity, sort, category, page, pageSize });
  const items = catalog.data?.items ?? [];

  const updateSearch = (value: string) => { setSearch(value); setPage(1); };
  const updateRarity = (value: GiftRarity | 'ALL') => { setRarity(value); setPage(1); };
  const updateSort = (value: typeof sort) => { setSort(value); setPage(1); };

  return (
    <div>
      <SectionHeader eyebrow={category ? `Category · ${category.replaceAll('-', ' ')}` : 'Marketplace'} title="Limited gifts" action={<span className="pb-1 text-[11px] font-semibold text-[#888]">{catalog.data?.total ?? 0} items</span>} />
      <FilterBar search={search} rarity={rarity} sort={sort} onSearchChange={updateSearch} onRarityChange={updateRarity} onSortChange={updateSort} />

      {catalog.isLoading ? (
        <div className="mt-4 grid grid-cols-2 gap-3">{[0, 1, 2, 3].map((item) => <div key={item} className="aspect-[0.72] animate-pulse rounded-[20px] bg-white/[0.05]" />)}</div>
      ) : catalog.isError ? (
        <div className="mt-4"><ErrorState message={catalog.error instanceof Error ? catalog.error.message : 'The catalog is unavailable.'} onRetry={() => void catalog.refetch()} /></div>
      ) : items.length ? (
        <><div className="mt-4 grid grid-cols-2 gap-3">{items.map((gift) => <GiftCard key={gift.id} gift={gift} />)}</div>
        {(catalog.data?.total ?? 0) > pageSize ? <div className="mt-5 flex items-center justify-center gap-3"><button type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-[11px] bg-[#292929] px-4 py-2.5 text-xs font-bold disabled:opacity-30">Previous</button><span className="text-xs text-white/40">Page {page}</span><button type="button" disabled={page * pageSize >= (catalog.data?.total ?? 0)} onClick={() => setPage((value) => value + 1)} className="rounded-[11px] bg-[#8269df] px-4 py-2.5 text-xs font-bold disabled:opacity-30">Next</button></div> : null}</>
      ) : (
        <div className="rounded-[28px] border border-dashed border-white/10 py-16 text-center">
          <div className="text-5xl">🔎</div>
          <h2 className="mt-4 font-extrabold">No gifts found</h2>
          <p className="mx-auto mt-2 max-w-[240px] text-sm leading-relaxed text-white/40">Try another name or clear a rarity filter.</p>
        </div>
      )}
    </div>
  );
}
