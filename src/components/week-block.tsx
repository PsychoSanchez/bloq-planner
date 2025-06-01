'use client';

import { Project } from '@/lib/types';
import { cn } from '@/lib/utils';
import { getProjectColorByName, getDefaultProjectColor } from '@/lib/project-colors';
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
  AlertTriangle,
} from 'lucide-react';

interface WeekBlockProps {
  project?: Project;
  isCompact?: boolean;
}

export function WeekBlock({ project, isCompact = false }: WeekBlockProps) {
  const getProjectStyles = (currentProject?: Project) => {
    let classes = 'bg-muted text-muted-foreground border-l-4 border-transparent';
    const projectType = currentProject?.type;

    const getIcon = () => {
      if (projectType) {
        switch (projectType) {
          case 'tech-debt':
            return <Wrench className="h-3.5 w-3.5 mr-1 flex-shrink-0" />;
          case 'team-event':
            return <Calendar className="h-3.5 w-3.5 mr-1 flex-shrink-0" />;
          case 'spillover':
            return <ArrowRightCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />;
          case 'blocked':
            return <XCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />;
          case 'hack':
            return <Sparkles className="h-3.5 w-3.5 mr-1 flex-shrink-0" />;
          case 'sick-leave':
            return <Thermometer className="h-3.5 w-3.5 mr-1 flex-shrink-0" />;
          case 'vacation':
            return <PalmtreeIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0" />;
          case 'onboarding':
            return <GraduationCap className="h-3.5 w-3.5 mr-1 flex-shrink-0" />;
          case 'duty':
            return <Shield className="h-3.5 w-3.5 mr-1 flex-shrink-0" />;
          case 'risky-week':
            return <AlertTriangle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />;
          default:
            return <FileCode2 className="h-3.5 w-3.5 mr-1 flex-shrink-0" />;
        }
      }

      return null;
    };

    const icon = getIcon();

    const selectedColorName = currentProject?.color;
    const colorObj = getProjectColorByName(selectedColorName) || (projectType ? null : getDefaultProjectColor());

    if (colorObj) {
      classes = colorObj.cn;
    } else if (projectType) {
      switch (projectType) {
        case 'tech-debt':
          classes = 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-l-4 border-amber-400';
          break;
        case 'team-event':
          classes = 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 border-l-4 border-blue-400';
          break;
        case 'spillover':
          classes =
            'bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200 border-l-4 border-purple-400';
          break;
        case 'blocked':
          classes = 'bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-200 border-l-4 border-red-400';
          break;
        case 'hack':
          classes =
            'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200 border-l-4 border-indigo-400';
          break;
        case 'sick-leave':
          classes = 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border-l-4 border-rose-400';
          break;
        case 'vacation':
          classes = 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-200 border-l-4 border-cyan-400';
          break;
        case 'onboarding':
          classes = 'bg-lime-50 dark:bg-lime-950/60 text-lime-800 dark:text-lime-200 border-l-4 border-lime-400';
          break;
        case 'duty':
          classes = 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-200 border-l-4 border-sky-400';
          break;
        case 'risky-week':
          classes =
            'bg-yellow-50 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-200 border-l-4 border-yellow-400';
          break;
        default:
          classes =
            'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-l-4 border-emerald-400';
          break;
      }
    } else {
      const defaultColorObj = getDefaultProjectColor();
      classes = defaultColorObj.cn;
    }

    return { classes, icon };
  };

  if (project) {
    const { classes, icon } = getProjectStyles(project);

    return (
      <div className={cn('flex items-center justify-start h-full w-full border-0 min-w-20 px-2 shadow-sm', classes)}>
        {!isCompact && icon}
        <span className="text-xs font-medium truncate">{project.slug}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full w-full border-0 min-w-20 bg-slate-50 dark:bg-slate-900/20">
      <span className="text-xs text-muted-foreground">--</span>
    </div>
  );
}
