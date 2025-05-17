import { Project } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface ProjectTypeBadgeProps {
  type: Project['type'];
}

export function ProjectTypeBadge({ type }: ProjectTypeBadgeProps) {
  const getTypeStyles = () => {
    switch (type) {
      case 'regular':
        return 'bg-blue-50 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300';
      case 'tech-debt':
        return 'bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-300';
      case 'team-event':
        return 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300';
      case 'spillover':
        return 'bg-purple-50 text-purple-800 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-300';
      case 'blocked':
        return 'bg-red-50 text-red-800 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300';
      case 'hack':
        return 'bg-green-50 text-green-800 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300';
      case 'sick-leave':
        return 'bg-rose-50 text-rose-800 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-300';
      case 'vacation':
        return 'bg-cyan-50 text-cyan-800 hover:bg-cyan-100 dark:bg-cyan-900/20 dark:text-cyan-300';
      case 'onboarding':
        return 'bg-teal-50 text-teal-800 hover:bg-teal-100 dark:bg-teal-900/20 dark:text-teal-300';
      case 'duty':
        return 'bg-gray-50 text-gray-800 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-300';
      case 'risky-week':
        return 'bg-orange-50 text-orange-800 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-300';
      default:
        return 'bg-gray-50 text-gray-800 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <Badge variant="outline" className={`text-[10px] h-5 px-1.5 py-0 font-normal ${getTypeStyles()}`}>
      {type.replace('-', ' ')}
    </Badge>
  );
}
