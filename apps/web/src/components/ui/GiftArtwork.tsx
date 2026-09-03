import type { Gift } from '@gifts/types';
import { rarityStyles } from '../../lib/giftStyles';

export function GiftArtwork({ gift, size = 'card' }: { gift: Gift; size?: 'card' | 'hero' }) {
  const style = rarityStyles[gift.rarity];
  return (
    <div className={`gift-art relative isolate overflow-hidden bg-gradient-to-br ${style.colors} ${size === 'hero' ? 'h-80' : 'aspect-square'}`}>
      <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-3xl" />
      <div className="absolute -bottom-16 -right-10 h-48 w-48 rounded-full blur-3xl" style={{ background: `${style.accent}55` }} />
      <div className="sparkle absolute left-[18%] top-[24%] text-white/70">✦</div>
      <div className="sparkle-delay absolute right-[17%] top-[18%] text-white/60">✧</div>
      <div className={`art-emoji relative z-10 grid h-full place-items-center drop-shadow-2xl ${size === 'hero' ? 'text-[9.5rem]' : 'text-[5.3rem]'}`}>
        {gift.imageUrl ? <img className="h-[76%] w-[76%] object-contain" src={gift.imageUrl} alt="" /> : gift.artwork}
      </div>
      <div className="absolute inset-x-5 bottom-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
        <span>{gift.source}</span>
        <span>#{gift.supply - gift.available + 1}</span>
      </div>
    </div>
  );
}
