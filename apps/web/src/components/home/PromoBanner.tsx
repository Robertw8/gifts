import type { Banner } from '@gifts/types';
import { Flame, Gamepad2, Rocket, Swords } from 'lucide-react';
import { Link } from 'react-router-dom';

const icons = { rocket: Rocket, pvp: Swords, play: Gamepad2 } as const;

export function PromoBanner({ banner }: { banner: Banner }) {
  const style = banner.style as keyof typeof icons;
  const Icon = icons[style] ?? Gamepad2;
  return (
    <Link to={banner.targetPath} className="promo-strip relative block h-[99px] overflow-hidden rounded-[20px] border border-white/10 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,.2)] active:scale-[.99]" style={{ background: `linear-gradient(135deg, ${banner.gradientFrom}, ${banner.gradientTo})` }}>
      <span className={`relative z-10 inline-flex items-center gap-1 rounded-[7px] bg-white px-2.5 py-1 text-[10px] font-extrabold ${style === 'rocket' ? 'text-[#4c9de3]' : 'text-[#ff873d]'}`}><Flame className="h-3 w-3" /> {banner.label}</span>
      <span className="absolute bottom-4 left-4 z-10 flex items-center gap-2 text-[24px] font-black tracking-[-0.03em] text-white"><Icon className="h-[20px] w-[20px]" /> {banner.title}</span>
      <span className="absolute right-6 top-1 grid h-[92px] w-[110px] place-items-center text-[70px] drop-shadow-2xl">{banner.imageUrl ? <img src={banner.imageUrl} alt="" className="h-full w-full object-contain" /> : banner.artwork}</span>
      {banner.subtitle ? <span className="absolute bottom-2 right-3 z-10 max-w-[100px] text-right text-[9px] font-bold leading-3 text-white/65">{banner.subtitle}</span> : null}
    </Link>
  );
}
