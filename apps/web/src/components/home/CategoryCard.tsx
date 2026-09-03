import type { Category } from '@gifts/types';
import { Gift as GiftIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="grid grid-cols-2 gap-3">
      {categories.map((category) => (
        <Link key={category.id} to={`/gifts?category=${category.slug}`} className="category-card relative min-w-0 overflow-hidden rounded-[23px] border bg-[#222]" style={{ borderColor: category.accent }}>
          <div className="category-art relative grid h-[176px] place-items-center overflow-hidden text-center" style={{ background: `radial-gradient(circle at 50% 48%, ${category.accent}2e, transparent 55%), #171717` }}>
            <span className="absolute top-4 z-10 px-2 text-[21px] font-black italic uppercase tracking-[-0.05em]" style={{ color: category.accent, textShadow: `0 0 15px ${category.accent}` }}>{category.name}</span>
            <span className="mt-7 text-[59px] leading-none drop-shadow-2xl">{category.artwork}</span>
          </div>
          <div className="flex h-[72px] items-center justify-between gap-2 bg-[#2b2b2b] px-4">
            <span className="text-[15px] font-extrabold leading-5">{category.giftCount ?? 0}<small className="block text-[10px] font-medium text-white/40">gifts</small></span>
            <span className="flex h-[36px] items-center gap-1.5 rounded-full px-3 text-[12px] font-extrabold text-white" style={{ backgroundColor: category.accent }}><GiftIcon className="h-4 w-4" /> VIEW</span>
          </div>
        </Link>
      ))}
    </section>
  );
}
