import type { TelegramOwnedGift } from '@gifts/types';
import { rarityStyles } from '../../lib/giftStyles';

export function TelegramOwnedGiftCard({ gift }: { gift: TelegramOwnedGift }) {
  const rarity = rarityStyles[gift.rarity];
  return (
    <article className="min-w-0 overflow-hidden rounded-[20px] border bg-[#252525]" style={{ borderColor: `${rarity.accent}bb` }}>
      <div className={`relative aspect-square overflow-hidden bg-gradient-to-br ${rarity.colors}`}>
        <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-white/15 blur-3xl" />
        <div className="relative z-10 grid h-full place-items-center text-[5.3rem] drop-shadow-2xl">
          {gift.imageUrl ? <img className="h-[76%] w-[76%] object-contain" src={gift.imageUrl} alt="" /> : gift.artwork}
        </div>
        <span className="absolute left-2.5 top-2.5 rounded-[7px] border border-white/10 bg-black/45 px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em] text-white backdrop-blur-md">TELEGRAM</span>
        {gift.uniqueNumber ? <span className="absolute bottom-3 right-3 rounded-full bg-black/45 px-2 py-1 text-[9px] font-bold text-white/70">#{gift.uniqueNumber}</span> : null}
      </div>
      <div className="min-h-[76px] p-3.5">
        <h3 className="truncate text-[14px] font-extrabold text-white">{gift.name}</h3>
        <p className="mt-1 text-[10px] uppercase tracking-[0.08em]" style={{ color: rarity.accent }}>{gift.kind}</p>
      </div>
    </article>
  );
}
