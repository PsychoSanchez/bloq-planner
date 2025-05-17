import { Badge } from '@/components/ui/badge';

type Priority = 'high' | 'medium' | 'low';

interface PriorityBadgeProps {
  priority: Priority | string;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const getPriorityStyles = () => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-50 text-red-800 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-50 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low':
        return 'bg-green-50 text-green-800 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300';
      default:
        return 'bg-gray-50 text-gray-800 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <Badge variant="outline" className={`text-[10px] h-5 px-1.5 py-0 font-normal ${getPriorityStyles()}`}>
      {priority}
    </Badge>
  );
}
