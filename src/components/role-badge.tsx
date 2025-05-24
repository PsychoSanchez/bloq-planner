import { cn } from '@/lib/utils';
import { ROLE_OPTIONS } from '@/lib/constants';

interface RoleBadgeProps {
  role: string;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  // Define colors based on role
  const getRoleColor = (role: string) => {
    const normalizedRole = role.toLowerCase();

    switch (normalizedRole) {
      case 'engineering':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'design':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'qa':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'product_management':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'operations':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'analytics':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'data_science':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default:
        // Fallback for legacy role names or unknown roles
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
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // Get display name from constants or fallback to original role
  const getDisplayName = (role: string) => {
    const roleOption = ROLE_OPTIONS.find((r) => r.id === role.toLowerCase());
    return roleOption ? roleOption.name : role;
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium',
        getRoleColor(role),
        className,
      )}
    >
      {getDisplayName(role)}
    </span>
  );
}
