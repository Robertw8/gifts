import { AlertCircle, LoaderCircle } from 'lucide-react';

export function LoadingState({ label = 'Loading…', compact = false }: { label?: string; compact?: boolean }) {
  return <div className={`grid place-items-center text-center text-white/45 ${compact ? 'py-8' : 'min-h-[320px]'}`}><div><LoaderCircle className="mx-auto h-6 w-6 animate-spin text-[#8d72eb]" /><p className="mt-3 text-xs">{label}</p></div></div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="grid min-h-[280px] place-items-center rounded-[18px] border border-red-400/10 bg-red-400/[0.04] px-6 text-center">
      <div><AlertCircle className="mx-auto h-7 w-7 text-red-300" /><p className="mt-3 text-sm font-bold">Unable to load data</p><p className="mt-2 text-xs leading-5 text-white/40">{message}</p>{onRetry ? <button type="button" onClick={onRetry} className="mt-4 rounded-[10px] bg-white/10 px-4 py-2 text-xs font-bold">Try again</button> : null}</div>
    </div>
  );
}
