import { cn } from '@/lib/utils';

interface RoleBadgeProps {
  role: string;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  // Define colors based on role
  const getRoleColor = (role: string) => {
    const normalizedRole = role.toLowerCase();

    if (normalizedRole.includes('engineer') || normalizedRole.includes('developer')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (normalizedRole.includes('designer')) {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    if (normalizedRole.includes('manager') || normalizedRole.includes('lead')) {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    }
    if (normalizedRole.includes('product')) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    if (normalizedRole.includes('marketing')) {
      return 'bg-rose-100 text-rose-800 border-rose-200';
    }
    // Default color
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium',
        getRoleColor(role),
        className,
      )}
    >
      {role}
    </span>
  );
}
