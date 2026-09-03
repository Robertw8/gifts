import type { Gift } from '@gifts/types';
import { Link } from 'react-router-dom';

const tileColors = [
  'from-[#ffc91c] to-[#e8a900]',
  'from-[#1cd4aa] to-[#14a777]',
  'from-[#3edac5] to-[#1ca99f]',
  'from-[#ffc416] to-[#eaa500]',
  'from-[#ffca19] to-[#e9aa00]',
  'from-[#ffba20] to-[#e59b00]',
  'from-[#d45df3] to-[#8d47db]',
];

export function GiftCarousel({ gifts }: { gifts: Gift[] }) {
  return (
    <section aria-label="Live gifts" className="-mx-4 flex h-[64px] items-center overflow-hidden pl-4">
      <div className="relative flex h-[58px] w-[34px] shrink-0 items-center justify-center">
        <span className="absolute left-1 top-0 h-2.5 w-2.5 rounded-full bg-[#35a85b] shadow-[0_0_0_4px_rgba(53,168,91,.12)]" />
        <span className="-rotate-90 whitespace-nowrap text-[15px] font-extrabold tracking-wide">Live</span>
      </div>
      <div className="no-scrollbar flex flex-1 gap-1.5 overflow-x-auto pr-4">
        {gifts.map((gift, index) => (
          <Link
            key={gift.id}
            to={`/gifts/${gift.id}`}
            className={`grid h-[49px] w-[49px] shrink-0 place-items-center rounded-[9px] border border-white/10 bg-gradient-to-br ${tileColors[index % tileColors.length]} text-[27px] shadow-[inset_0_1px_0_rgba(255,255,255,.28)] transition active:scale-95`}
          >
            {gift.imageUrl ? <img className="h-[84%] w-[84%] object-contain" src={gift.imageUrl} alt="" /> : gift.artwork}
          </Link>
        ))}
      </div>
    </section>
  );
}
