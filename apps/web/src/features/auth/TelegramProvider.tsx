import type { AuthResponse, User } from '@gifts/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldAlert } from 'lucide-react';
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { apiRequest, setAccessToken } from '../../lib/api';
import { initializeTelegram } from './telegram';

interface TelegramContextValue {
  user: User;
  isTelegram: true;
}

const TelegramContext = createContext<TelegramContextValue | null>(null);

export function TelegramProvider({ children }: { children: ReactNode }) {
  const webApp = useMemo(() => initializeTelegram(), []);
  const initData = webApp?.initData ?? '';
  const queryClient = useQueryClient();

  const auth = useQuery({
    queryKey: ['telegram-auth'],
    queryFn: async () => {
      const response = await apiRequest<AuthResponse>('/auth/telegram', {
        method: 'POST',
        body: JSON.stringify({ initData }),
      });
      setAccessToken(response.accessToken);
      queryClient.setQueryData(['me'], response.user);
      return response;
    },
    enabled: Boolean(initData),
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const value = useMemo<TelegramContextValue | null>(() => auth.data ? ({ user: auth.data.user, isTelegram: true }) : null, [auth.data]);

  if (!initData) return <AuthState title="Open inside Telegram" message="Launch this Mini App from its Telegram bot to sign in securely." />;
  if (auth.isLoading) return <AuthState title="Connecting to Telegram" message="Verifying your secure launch data…" loading />;
  if (auth.isError || !value) return <AuthState title="Authentication failed" message={auth.error instanceof Error ? auth.error.message : 'Please reopen the Mini App from Telegram.'} onRetry={() => void auth.refetch()} />;

  return <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>;
}

function AuthState({ title, message, loading = false, onRetry }: { title: string; message: string; loading?: boolean; onRetry?: () => void }) {
  return (
    <main className="mx-auto grid min-h-[100dvh] max-w-[430px] place-items-center bg-[#111] px-8 text-center text-white">
      <div>
        <div className={`mx-auto grid h-16 w-16 place-items-center rounded-[20px] bg-[#8269df]/15 text-[#9d88ee] ${loading ? 'animate-pulse' : ''}`}><ShieldAlert className="h-8 w-8" /></div>
        <h1 className="mt-5 text-xl font-extrabold">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-white/45">{message}</p>
        {onRetry ? <button type="button" onClick={onRetry} className="mt-5 rounded-[12px] bg-[#8269df] px-5 py-3 text-sm font-bold">Try again</button> : null}
      </div>
    </main>
  );
}

export function useTelegram() {
  const context = useContext(TelegramContext);
  if (!context) throw new Error('useTelegram must be used within TelegramProvider');
  return context;
}
