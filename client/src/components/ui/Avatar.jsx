import { cn } from '@/utils/cn';
import { getInitials } from '@/utils/helpers';

const sizeMap = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

export const Avatar = ({ user, size = 'md', className }) => {
  const name = user?.name || 'User';
  const src = user?.avatarUrl || user?.avatar;

  return (
    <div
      className={cn(
        'rounded-full bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-white',
        sizeMap[size],
        className
      )}
      title={name}
      aria-label={name}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};

export const AvatarGroup = ({ users = [], max = 4, size = 'sm' }) => {
  const visible = users.slice(0, max);
  const extra = users.length - max;
  const sizes = { xs: 'w-6 h-6', sm: 'w-8 h-8', md: 'w-10 h-10' };

  return (
    <div className="flex -space-x-2">
      {visible.map((user, i) => (
        <Avatar key={user._id || i} user={user} size={size} />
      ))}
      {extra > 0 && (
        <div className={cn(
          'rounded-full bg-slate-100 text-slate-600 text-xs font-semibold flex items-center justify-center ring-2 ring-white shrink-0',
          sizes[size]
        )}>
          +{extra}
        </div>
      )}
    </div>
  );
};
