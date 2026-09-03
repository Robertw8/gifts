import type { Gift } from '@gifts/types';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { rarityStyles } from '../../lib/giftStyles';
import { haptic } from '../../features/auth/telegram';
import { GiftArtwork } from '../ui/GiftArtwork';
import { TonIcon } from '../ui/TonIcon';

export function GiftCard({ gift, compact = false }: { gift: Gift; compact?: boolean }) {
  const rarity = rarityStyles[gift.rarity];
  return (
    <Link
      to={`/gifts/${gift.id}`}
      onClick={() => haptic('light')}
      className="gift-card group min-w-0 overflow-hidden rounded-[20px] border bg-[#252525] transition active:scale-[0.98]"
      style={{ borderColor: `${rarity.accent}bb` }}
    >
      <div className="relative">
        <GiftArtwork gift={gift} />
        <span className="absolute left-2.5 top-2.5 rounded-[7px] border border-white/10 bg-black/45 px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em] backdrop-blur-md" style={{ color: rarity.accent }}>
          {rarity.label}
        </span>
      </div>
      <div className={`${compact ? 'p-3' : 'p-3.5'} flex min-h-[76px] items-center justify-between gap-2`}>
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-1">
          <div className="min-w-0">
              <h3 className="truncate text-[14px] font-extrabold text-white">{gift.name}</h3>
              <p className="mt-1 text-[10px] text-[#999]">{gift.source === 'TELEGRAM' && gift.available >= 2_000_000_000 ? 'Unlimited' : `${gift.available.toLocaleString()} left`}</p>
            </div>
          </div>
        </div>
        <div className="flex h-[34px] shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-extrabold text-white" style={{ backgroundColor: rarity.accent }}>
          {gift.source === 'TELEGRAM' ? <Star className="h-4 w-4" fill="currentColor" /> : <TonIcon size={16} />} {gift.price}
        </div>
      </div>
    </Link>
  );
}
