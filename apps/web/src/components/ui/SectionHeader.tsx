import type { ReactNode } from 'react';

export function SectionHeader({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        {eyebrow ? <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8d72eb]">{eyebrow}</p> : null}
        <h2 className="mt-0.5 text-[22px] font-extrabold tracking-[-0.025em] text-white">{title}</h2>
      </div>
      {action}
    </div>
  );
}
