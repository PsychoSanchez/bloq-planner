'use client';

import { Project } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface WeekBlockProps {
  project?: Project;
}

export function WeekBlock({ project }: WeekBlockProps) {
  // Map project types to tailwind classes that match shadcn theme colors
  const getProjectClasses = (type?: string) => {
    if (!type) return 'bg-muted text-muted-foreground';

    switch (type) {
      case 'tech-debt':
        return 'bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300';
      case 'team-event':
        return 'bg-blue-100 dark:bg-blue-950/50 text-blue-900 dark:text-blue-300';
      case 'spillover':
        return 'bg-orange-100 dark:bg-orange-950/50 text-orange-900 dark:text-orange-300';
      case 'blocked':
        return 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
      case 'hack':
        return 'bg-indigo-500 dark:bg-indigo-600 text-white';
      default:
        return 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300';
    }
  };

  // If we have a project, wrap it in a tooltip
  if (project) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'flex items-center justify-center h-full w-full border-0 min-w-20',
                getProjectClasses(project.type),
              )}
            >
              <span className="text-xs font-medium truncate">{project.name}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              <strong>{project.name}</strong>
            </p>
            <p className="text-xs text-muted-foreground">Type: {project.type}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Empty block
  return (
    <div className="flex items-center justify-center h-full w-full border-0 min-w-20">
      <span className="text-xs text-muted-foreground">--</span>
    </div>
  );
}
