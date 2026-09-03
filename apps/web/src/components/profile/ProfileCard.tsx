import { UserRound } from 'lucide-react';
import { useProfile } from '../../features/marketplace/hooks';

export function ProfileCard() {
  const profile = useProfile();
  const user = profile.data;
  if (!user) return <section className="h-[86px] animate-pulse rounded-[16px] bg-[#272727]" />;
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return (
    <section className="flex items-center gap-3 rounded-[16px] bg-[#272727] p-3.5">
      <div className="relative grid h-[58px] w-[58px] shrink-0 place-items-center overflow-hidden rounded-full border-2 border-[#8b6be8] bg-[#181818] text-[#8b6be8]">
        {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-7 w-7" />}
        <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-[#272727] bg-[#36b467]" />
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[18px] font-extrabold">{fullName}</h1>
        <p className="mt-0.5 truncate text-[12px] text-[#999]">@{user.username ?? 'telegram_user'}</p>
      </div>
      <span className="rounded-full bg-[#8269df]/15 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-[#a994ff]">Verified</span>
    </section>
  );
}
