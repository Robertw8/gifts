import type { GiftRarity } from '@gifts/types';
import { ArrowDownUp, Search, X } from 'lucide-react';

const rarities: Array<{ value: GiftRarity | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'COMMON', label: 'Common' },
  { value: 'RARE', label: 'Rare' },
  { value: 'EPIC', label: 'Epic' },
  { value: 'LEGENDARY', label: 'Legendary' },
];

interface FilterBarProps {
  search: string;
  rarity: GiftRarity | 'ALL';
  sort: 'featured' | 'popular' | 'price-asc' | 'price-desc' | 'newest';
  onSearchChange(value: string): void;
  onRarityChange(value: GiftRarity | 'ALL'): void;
  onSortChange(value: FilterBarProps['sort']): void;
}

export function FilterBar({ search, rarity, sort, onSearchChange, onRarityChange, onSortChange }: FilterBarProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex gap-2">
        <label className="flex h-[43px] flex-1 items-center gap-2.5 rounded-[12px] bg-[#2b2b2b] px-3 focus-within:ring-1 focus-within:ring-[#8269df]">
          <Search className="h-[18px] w-[18px] shrink-0 text-[#a3a3a3]" />
          <input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search gifts" className="w-full border-0 bg-transparent p-0 text-[14px] text-white placeholder:text-[#969696] focus:ring-0" />
          {search ? <button type="button" onClick={() => onSearchChange('')} aria-label="Clear search"><X className="h-4 w-4 text-white/40" /></button> : null}
        </label>
        <label className="grid h-[43px] w-[43px] shrink-0 place-items-center rounded-[12px] bg-[#8269df] text-white">
          <ArrowDownUp className="pointer-events-none h-[18px] w-[18px]" />
          <select value={sort} onChange={(event) => onSortChange(event.target.value as FilterBarProps['sort'])} aria-label="Sort gifts" className="absolute h-[43px] w-[43px] cursor-pointer opacity-0">
            <option value="featured">Featured</option>
            <option value="popular">Popular</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: low</option>
            <option value="price-desc">Price: high</option>
          </select>
        </label>
      </div>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {rarities.map((item) => (
          <button key={item.value} type="button" onClick={() => onRarityChange(item.value)} className={`shrink-0 rounded-[10px] px-3.5 py-2 text-[12px] font-bold transition ${rarity === item.value ? 'bg-[#8269df] text-white' : 'bg-[#2b2b2b] text-[#a6a6a6]'}`}>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
