interface UserAvatarProps {
  username: string;
  avatarUrl?: string | null;
  role?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
}

export default function UserAvatar({
  username,
  avatarUrl,
  role,
  size = 'md',
  showBadge = false,
}: UserAvatarProps) {
  const isAdmin = role === 'admin';

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-16 w-16 text-xl',
    xl: 'h-24 w-24 text-3xl',
  };

  const badgeSize = {
    sm: 'h-3.5 w-3.5 text-[8px]',
    md: 'h-4 w-4 text-[9px]',
    lg: 'h-5 w-5 text-[10px]',
    xl: 'h-6 w-6 text-xs',
  };

  // Convert stored relative path (e.g. "userId/avatar.jpg") to our serving endpoint
  const avatarSrc = avatarUrl
    ? avatarUrl.includes('/')
      ? `/api/avatars/${avatarUrl.split('/')[0]}`
      : avatarUrl
    : undefined;

  if (avatarSrc) {
    return (
      <div className="relative inline-block">
        <img
          src={avatarSrc}
          alt={username}
          className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-white dark:ring-zinc-900`}
        />
        {showBadge && isAdmin && (
          <div className={`absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full bg-orange-500 text-white font-bold ${badgeSize[size]}`}>
            A
          </div>
        )}
      </div>
    );
  }

  // Default avatar using initials
  const initial = username.charAt(0).toUpperCase();

  return (
    <div className="relative inline-block">
      <div
        className={`${sizeClasses[size]} flex items-center justify-center rounded-full font-semibold text-white ${
          isAdmin
            ? 'bg-gradient-to-br from-orange-500 to-amber-600'
            : 'bg-zinc-600 dark:bg-zinc-700'
        }`}
      >
        {initial}
      </div>
      {showBadge && isAdmin && (
        <div className={`absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full bg-orange-500 text-white font-bold ring-2 ring-white dark:ring-zinc-900 ${badgeSize[size]}`}>
          A
        </div>
      )}
    </div>
  );
}
