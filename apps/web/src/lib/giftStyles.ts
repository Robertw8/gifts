export const rarityStyles = {
  COMMON: { label: 'Common', colors: 'from-slate-600/60 via-slate-800 to-[#171923]', accent: '#94a3b8' },
  RARE: { label: 'Rare', colors: 'from-sky-500/55 via-blue-950 to-[#141729]', accent: '#38bdf8' },
  EPIC: { label: 'Epic', colors: 'from-violet-500/65 via-purple-950 to-[#1d1530]', accent: '#a78bfa' },
  LEGENDARY: { label: 'Legendary', colors: 'from-amber-400/55 via-orange-950 to-[#25190e]', accent: '#fbbf24' },
} as const;

export function formatTon(value: string | number) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '—';
  return numeric.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}
