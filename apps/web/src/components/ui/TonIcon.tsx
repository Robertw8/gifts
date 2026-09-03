export function TonIcon({ size = 18 }: { size?: number }) {
  return (
    <span
      aria-label="TON"
      className="inline-grid shrink-0 place-items-center rounded-full bg-[#16a9ea] text-[0.58em] font-black text-white"
      style={{ width: size, height: size }}
    >
      ◇
    </span>
  );
}
