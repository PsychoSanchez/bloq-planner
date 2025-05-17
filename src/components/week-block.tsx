'use client';

import { Project } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Wrench, 
  Calendar, 
  ArrowRightCircle, 
  XCircle, 
  Sparkles, 
  FileCode2,
  Thermometer,
  PalmtreeIcon,
  GraduationCap,
  Shield,
  AlertTriangle
} from 'lucide-react';

interface WeekBlockProps {
  project?: Project;
  isCompact?: boolean;
}

export function WeekBlock({ project, isCompact = false }: WeekBlockProps) {
  // Map project types to tailwind classes and icons
  const getProjectStyles = (type?: string) => {
    if (!type) return { 
      classes: 'bg-muted text-muted-foreground',
      icon: null
    };

    switch (type) {
      case 'tech-debt':
        return { 
          classes: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-l-4 border-amber-400',
          icon: <Wrench className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
        };
      case 'team-event':
        return { 
          classes: 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 border-l-4 border-blue-400',
          icon: <Calendar className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
        };
      case 'spillover':
        return { 
          classes: 'bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200 border-l-4 border-purple-400',
          icon: <ArrowRightCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
        };
      case 'blocked':
        return { 
          classes: 'bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-200 border-l-4 border-red-400',
          icon: <XCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
        };
      case 'hack':
        return { 
          classes: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200 border-l-4 border-indigo-400',
          icon: <Sparkles className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
        };
      case 'sick-leave':
        return { 
          classes: 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border-l-4 border-rose-400',
          icon: <Thermometer className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
        };
      case 'vacation':
        return { 
          classes: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-200 border-l-4 border-cyan-400',
          icon: <PalmtreeIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
        };
      case 'onboarding':
        return { 
          classes: 'bg-lime-50 dark:bg-lime-950/60 text-lime-800 dark:text-lime-200 border-l-4 border-lime-400',
          icon: <GraduationCap className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
        };
      case 'duty':
        return { 
          classes: 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-200 border-l-4 border-sky-400',
          icon: <Shield className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
        };
      case 'risky-week':
        return { 
          classes: 'bg-yellow-50 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-200 border-l-4 border-yellow-400',
          icon: <AlertTriangle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
        };
      default:
        return { 
          classes: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-l-4 border-emerald-400',
          icon: <FileCode2 className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
        };
    }
  };

  // If we have a project, wrap it in a tooltip
  if (project) {
    const { classes, icon } = getProjectStyles(project.type);
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'flex items-center justify-start h-full w-full border-0 min-w-20 px-2 shadow-sm',
                classes,
              )}
              style={project.color ? { borderLeftColor: project.color } : undefined}
            >
              {!isCompact && icon}
              <span className="text-xs font-medium truncate">{project.name}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="p-3">
            <div className="space-y-1.5">
              <p className="font-semibold">{project.name}</p>
              <div className="flex items-center text-xs text-muted-foreground">
                {icon}
                <span className="ml-1 capitalize">{project.type.replace('-', ' ')}</span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Empty block
  return (
    <div className="flex items-center justify-center h-full w-full border-0 min-w-20 bg-slate-50 dark:bg-slate-900/20">
      <span className="text-xs text-muted-foreground">--</span>
    </div>
  );
}
